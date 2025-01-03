package main

import (
	"flag"
	"log"
	"net/http"
	"os"

	"github.com/joshzcold/Cold-Friendly-Feud/api"
)

var cfg = struct {
	addr  string
	store string
}{}

func flags() {
	flag.StringVar(&cfg.addr, "listen_address", ":8080", "Address for server to bind to.")
	flag.StringVar(&cfg.store, "game_store", "memory", "Choice of storage medium of the game")
	flag.Parse()

	if envAddr := os.Getenv("LISTEN_ADDRESS"); envAddr != "" {
		cfg.addr = envAddr
	}

	if envGameStore := os.Getenv("GAME_STORE"); envGameStore != "" {
		cfg.store = envGameStore
	}
}

func main() {
	flags()
	err := api.NewGameStore(cfg.store)
	if err != nil {
		log.Panicf("Error: unable initalize store: %s", err)
	}

	http.HandleFunc("/api/ws", func(httpWriter http.ResponseWriter, httpRequest *http.Request) {
		api.ServeWs(httpWriter, httpRequest)
	})

	http.HandleFunc("/api/healthcheckz", func(httpWriter http.ResponseWriter, httpRequest *http.Request) {
		httpWriter.Write([]byte("ok"))
		httpWriter.WriteHeader(200)
	})

	http.HandleFunc("/api/rooms/{roomCode}/logo", func(httpWriter http.ResponseWriter, httpRequest *http.Request) {
		roomCode := httpRequest.PathValue("roomCode")
		api.FetchLogo(httpWriter, roomCode)
	})
	log.Printf("Server listening on %s", cfg.addr)
	err = http.ListenAndServe(*&cfg.addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
