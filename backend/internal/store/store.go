package store

import (
	"fmt"
	"log"

	"github.com/joshzcold/Cold-Friendly-Feud/internal/errors"
)

var store gameStore

// gameStore interface to implement a game store location
// defines functions required to implement the state of the game.
type gameStore interface {
	// List of active rooms on the server
	currentRooms() []string
	// Game data of room
	getRoom(*Client, string) (room, errors.GameError)
	// Update game data of room
	writeRoom(string, room) errors.GameError
	// Erase room from server
	deleteRoom(string) errors.GameError
	// Save an image file for the game logo
	saveLogo(string, []byte) errors.GameError
	// Load a logo image from room
	loadLogo(string) ([]byte, errors.GameError)
	// Delete a logo image from room
	deleteLogo(string) errors.GameError
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
