package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/joshzcold/Cold-Friendly-Feud/api"
)

var cfg = struct {
	addr               string
	store              string
	roomTimeoutSeconds int64
}{
	addr:               ":8080",
	store:              "memory",
	roomTimeoutSeconds: 86400,
}

func flags() {
	flag.StringVar(&cfg.addr, "listen_address", cfg.addr, "Address for server to bind to.")
	flag.StringVar(&cfg.store, "game_store", cfg.store, "Choice of storage medium of the game")
	flag.Int64Var(&cfg.roomTimeoutSeconds, "room_timeout_seconds", cfg.roomTimeoutSeconds, "Seconds before inactive rooms are cleaned up")
	flag.Parse()

	if envAddr := os.Getenv("LISTEN_ADDRESS"); envAddr != "" {
		cfg.addr = envAddr
	}

	if envGameStore := os.Getenv("GAME_STORE"); envGameStore != "" {
		cfg.store = envGameStore
	}

	if envTimeout := os.Getenv("ROOM_TIMEOUT_SECONDS"); envTimeout != "" {
		if timeout, err := strconv.ParseInt(envTimeout, 10, 64); err == nil {
			cfg.roomTimeoutSeconds = timeout
		}
	}
}

func main() {
	flags()
	api.SetConfig(cfg.roomTimeoutSeconds)
	err := api.NewGameStore(cfg.store)
	if err != nil {
		log.Panicf("Error: unable initalize store: %s", err)
	}

	hub := api.NewHub()
	go hub.Run()

	http.HandleFunc("/api/ws", func(httpWriter http.ResponseWriter, httpRequest *http.Request) {
		api.ServeWs(hub, httpWriter, httpRequest)
	})

	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		status, err := api.HealthTest(cfg.addr)

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
	log.Printf("Server listening on %s", cfg.addr)
	err = http.ListenAndServe(cfg.addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
