package store

import (
	"fmt"
	"log"

	"github.com/joshzcold/Cold-Friendly-Feud/internal/errors"
	"github.com/joshzcold/Cold-Friendly-Feud/internal/game"
)

var store GameStore

// GameStore interface to implement a game store location
// defines functions required to implement the state of the game.
type GameStore interface {
	// List of active rooms on the server
	ListRooms() []string
	// Game data of room
	GetGame(string) (*game.Game, errors.GameError)
	// Update game data of room
	SaveGame(string, *game.Game) errors.GameError
	// Erase room from server
	DeleteGame(string) errors.GameError
	// Save an image file for the game logo
	SaveLogo(string, []byte) errors.GameError
	// Load a logo image from room
	LoadLogo(string) ([]byte, errors.GameError)
	// Delete a logo image from room
	DeleteLogo(string) errors.GameError
	// Health check
	IsHealthy() error
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
