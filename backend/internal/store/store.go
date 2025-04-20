package api

import (
	"fmt"
	"log"
)

var store gameStore

// gameStore interface to implement a game store location
// defines functions required to implement the state of the game.
type gameStore interface {
	// List of active rooms on the server
	currentRooms() []string
	// Game data of room
	getRoom(*Client, string) (room, GameError)
	// Update game data of room
	writeRoom(string, room) GameError
	// Erase room from server
	deleteRoom(string) GameError
	// Save an image file for the game logo
	saveLogo(string, []byte) GameError
	// Load a logo image from room
	loadLogo(string) ([]byte, GameError)
	// Delete a logo image from room
	deleteLogo(string) GameError
	// Health check
	isHealthy() error
}

func NewGameStore(gameStore string) error {
	switch gameStore {
	case "memory":
		log.Println("Starting famf with memory store")
		store = NewMemoryStore()
		return nil
	case "sqlite":
		log.Println("Starting famf with sqlite store")
		store, _ = NewSQLiteStore()
	default:
		return fmt.Errorf("unknown store: %q", gameStore)
	}
	return nil
}
