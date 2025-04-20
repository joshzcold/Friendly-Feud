package config

import (
	"flag"
	"os"
	"strconv"
)

var Config = struct {
	Addr               string
	Store              string
	RoomTimeoutSeconds int64
	AllowedOrigins     string
}{
	Addr:               ":8080",
	Store:              "memory",
	RoomTimeoutSeconds: 86400,
	AllowedOrigins:     "*",
}

func Flags() {
	flag.StringVar(&Config.Addr, "listen_address", Config.Addr, "Address for server to bind to.")
	flag.StringVar(&Config.Store, "game_store", Config.Store, "Choice of storage medium of the game")
	flag.Int64Var(&Config.RoomTimeoutSeconds, "room_timeout_seconds", Config.RoomTimeoutSeconds, "Seconds before inactive rooms are cleaned up")
	flag.StringVar(&Config.AllowedOrigins, "allowed_origins", Config.AllowedOrigins, "Comma-separated list of allowed origins for WebSocket connections or * for all")
	flag.Parse()

	if envAddr := os.Getenv("LISTEN_ADDRESS"); envAddr != "" {
		Config.Addr = envAddr
	}

	if envGameStore := os.Getenv("GAME_STORE"); envGameStore != "" {
		Config.Store = envGameStore
	}

	if envTimeout := os.Getenv("ROOM_TIMEOUT_SECONDS"); envTimeout != "" {
		if timeout, err := strconv.ParseInt(envTimeout, 10, 64); err == nil {
			Config.RoomTimeoutSeconds = timeout
		}
	}

	if envOrigins := os.Getenv("ALLOWED_ORIGINS"); envOrigins != "" {
		Config.AllowedOrigins = envOrigins
	}
}