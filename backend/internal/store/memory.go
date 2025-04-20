package store

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"

	"github.com/joshzcold/Cold-Friendly-Feud/internal/errors"
)

type MemoryStore struct {
	mu    sync.RWMutex
	rooms map[string]room
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		rooms: make(map[string]room),
	}
}

func (m *MemoryStore) currentRooms() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	keys := make([]string, len(m.rooms))
	for k := range m.rooms {
		keys = append(keys, k)
	}
	return keys
}

func (m *MemoryStore) getRoom(client *Client, roomCode string) (room, errors.GameError) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	foundGame, ok := m.rooms[roomCode]
	if ok {
		return foundGame, errors.GameError{}
	}
	return room{}, errors.GameError{Code: errors.ROOM_NOT_FOUND}
}

func (m *MemoryStore) writeRoom(roomCode string, room room) errors.GameError {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.rooms[roomCode] = room
	return errors.GameError{}
}

func (m *MemoryStore) deleteRoom(roomCode string) errors.GameError {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.rooms, roomCode)
	return errors.GameError{}
}

func (m *MemoryStore) saveLogo(roomCode string, logo []byte) errors.GameError {
	dirPath := filepath.Join(".", "public", "rooms", roomCode)
	err := VerifyLogo(logo)
	if err != nil {
		return errors.GameError{Code: errors.SERVER_ERROR, Message: fmt.Sprint(err)}
	}
	err = os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		return errors.GameError{Code: errors.SERVER_ERROR, Message: fmt.Sprint(err)}
	}

	err = os.WriteFile(filepath.Join(dirPath, "logo"), logo, 0644)
	if err != nil {
		return errors.GameError{Code: errors.SERVER_ERROR, Message: fmt.Sprint(err)}
	}
	return errors.GameError{}
}

func (m *MemoryStore) loadLogo(roomCode string) ([]byte, errors.GameError) {
	log.Println("Trying to load logo from", "./public/rooms/", roomCode, "logo")
	logoPath := filepath.Join(".", "public", "rooms", roomCode, "logo")
	_, err := os.Stat(logoPath)
	if err != nil {
		return nil, errors.GameError{Code: errors.SERVER_ERROR, Message: fmt.Sprint(err)}
	}
	logo, err := os.ReadFile(logoPath)
	if err != nil {
		return nil, errors.GameError{Code: errors.SERVER_ERROR, Message: fmt.Sprint(err)}
	}
	return logo, errors.GameError{}
}

func (m *MemoryStore) deleteLogo(roomCode string) errors.GameError {
	logoPath := filepath.Join(".", "public", "rooms", roomCode, "logo")
	_, err := os.Stat(logoPath)
	if err != nil {
		return errors.GameError{Code: errors.SERVER_ERROR, Message: fmt.Sprint(err)}
	}
	err = os.Remove(logoPath)
	if err != nil {
		return errors.GameError{Code: errors.SERVER_ERROR, Message: fmt.Sprint(err)}
	}
	return errors.GameError{}
}

func (m *MemoryStore) isHealthy() error {
	if m.rooms == nil {
		return fmt.Errorf("memory store is not initialized")
	}
	return nil
}
