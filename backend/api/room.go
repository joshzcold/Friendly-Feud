package api

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/google/uuid"
)

const ()

var roomLetterLength = 4
var roomLetters = []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

var cfg struct {
	roomTimeoutSeconds int64
}

func SetConfig(timeoutSeconds int64) {
	cfg.roomTimeoutSeconds = timeoutSeconds
}

// MakeRoom return a room code from random pick of characters of room code length
func roomCode() string {
	b := make([]rune, roomLetterLength)
	for i := range b {
		b[i] = roomLetters[rand.Intn(len(roomLetters))]
	}
	return string(b)
}

func playerID() string {
	return uuid.New().String()
}

// pingInterval Send a ping message every 5 seconds on a player
// This is to try and calcuate latency of a player when acting on buzzers
func (p *RegisteredClient) pingInterval() error {
	log.Println("Started ping for interval", p.id)
	ticker := time.NewTicker(5 * time.Second)
	defer func() {
		ticker.Stop()
	}()
	for {
		select {
		case <-ticker.C:
			player, ok := p.room.Game.RegisteredPlayers[p.id]
			if !ok {
				log.Println("Player not found stopping ping", p.id)
				return nil
			}
			player.Start = time.Now()
			message, err := NewSendPing(p.id)
			if err != nil {
				return fmt.Errorf(" %w", err)
			}
			if p.client.send != nil {
				p.client.send <- message
			}
		// Stop ping interval when client stops
		case <-p.client.stop:
			log.Println("Stop ping via channel", p.id)
			return nil
		}
	}
}

func (r *room) gameTimeout() error {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			timeout := time.Duration(cfg.roomTimeoutSeconds) * time.Second
			timeoutAgo := time.Now().UTC().Add(-timeout).UnixMilli()
			if r.Game.Tick > 0 && r.Game.Tick < timeoutAgo {
				log.Println("clearing room, no activity for", cfg.roomTimeoutSeconds, "seconds:", r.Game.Room)
				message, err := NewSendQuit()
				if err != nil {
					return fmt.Errorf(" %w", err)
				}
				r.Hub.broadcast <- message
				message, err = NewSendError(GameError{code: GAME_CLOSED})
				if err != nil {
					return fmt.Errorf(" %w", err)
				}
				r.Hub.broadcast <- message
				store.deleteLogo(r.Game.Room)
				store.deleteRoom(r.Game.Room)
				return nil
			}
		// If host quits, remove loop
		case <-r.cleanup:
			return nil
		}
	}
}

type RegisteredClient struct {
	id       string
	client   *Client
	room     *room
}

type roomConnections struct {
	Hub *Hub
	// Get lag of each client
	registeredClients map[string]*RegisteredClient
}

type room struct {
	Game *game `json:"game"`
	// Assign to ws Hub when hosting room
	roomConnections
	cleanup chan struct{}
}
