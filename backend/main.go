package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/joshzcold/Cold-Friendly-Feud/api"
	"github.com/joshzcold/Cold-Friendly-Feud/internal/config"
)

func main() {
	config.Flags()
	api.SetConfig(config.Config.RoomTimeoutSeconds)
	// Set allowed origins for WebSocket connections
	os.Setenv("ALLOWED_ORIGINS", config.Config.AllowedOrigins)
	err := api.NewGameStore(config.Config.Store)
	if err != nil {
		log.Panicf("Error: unable initalize store: %s", err)
	}

	http.HandleFunc("/api/ws", func(httpWriter http.ResponseWriter, httpRequest *http.Request) {
		api.ServeWs(httpWriter, httpRequest)
	})

	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		status, err := api.HealthTest(config.Config.Addr)

		if err != nil {
			w.WriteHeader(503)
		} else {
			w.WriteHeader(200)
		}

		json.NewEncoder(w).Encode(status)
	})

	http.HandleFunc("/api/rooms/{roomCode}/logo", func(httpWriter http.ResponseWriter, httpRequest *http.Request) {
		roomCode := httpRequest.PathValue("roomCode")
		api.FetchLogo(httpWriter, roomCode)
	})
	log.Printf("Server listening on %s", config.Config.Addr)
	err = http.ListenAndServe(config.Config.Addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
