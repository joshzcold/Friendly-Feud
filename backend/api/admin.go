package api

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"sync"
	"time"
)

type AdminPlayerSummary struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Team      *int   `json:"team"`
	IsHost    bool   `json:"isHost"`
	Connected bool   `json:"connected"`
}

type AdminRoomSummary struct {
	RoomCode       string               `json:"roomCode"`
	HostID         string               `json:"hostId"`
	PlayerCount    int                  `json:"playerCount"`
	SessionCount   int                  `json:"sessionCount"`
	LastActivityMs int64                `json:"lastActivityMs"`
	LastActivity   string               `json:"lastActivity"`
	Players        []AdminPlayerSummary `json:"players"`
}

var adminState = struct {
	sync.RWMutex
	roomCreationPaused bool
}{}

func isRoomCreationPaused() bool {
	adminState.RLock()
	defer adminState.RUnlock()
	return adminState.roomCreationPaused
}

func setRoomCreationPaused(paused bool) {
	adminState.Lock()
	defer adminState.Unlock()
	adminState.roomCreationPaused = paused
}

func AdminAuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		expectedPassword := os.Getenv("ADMIN_CONSOLE_PASSWORD")
		providedPassword := r.Header.Get("X-Admin-Password")
		expectedPasswordHash := sha256.Sum256([]byte(expectedPassword))
		providedPasswordHash := sha256.Sum256([]byte(providedPassword))

		if expectedPassword == "" || subtle.ConstantTimeCompare(expectedPasswordHash[:], providedPasswordHash[:]) != 1 {
			writeAdminJSON(w, http.StatusUnauthorized, map[string]any{
				"success": false,
				"error":   "Unauthorized",
			})
			return
		}

		next(w, r)
	}
}

func writeAdminJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func adminRoomSummary(room room) AdminRoomSummary {
	connectedSessions := make(map[string]bool, len(room.registeredClients))
	for id := range room.registeredClients {
		connectedSessions[id] = true
	}

	players := make([]AdminPlayerSummary, 0, len(room.Game.RegisteredPlayers)+1)
	if room.Game.Host.ID != "" {
		players = append(players, AdminPlayerSummary{
			ID:        room.Game.Host.ID,
			Name:      "Host",
			IsHost:    true,
			Connected: connectedSessions[room.Game.Host.ID],
		})
	}

	for id, player := range room.Game.RegisteredPlayers {
		players = append(players, AdminPlayerSummary{
			ID:        id,
			Name:      player.Name,
			Team:      player.Team,
			IsHost:    false,
			Connected: connectedSessions[id],
		})
	}

	sort.Slice(players, func(i int, j int) bool {
		if players[i].IsHost != players[j].IsHost {
			return players[i].IsHost
		}
		return players[i].Name < players[j].Name
	})

	lastActivity := ""
	if room.Game.Tick > 0 {
		lastActivity = time.UnixMilli(room.Game.Tick).UTC().Format(time.RFC3339)
	}

	return AdminRoomSummary{
		RoomCode:       room.Game.Room,
		HostID:         room.Game.Host.ID,
		PlayerCount:    len(room.Game.RegisteredPlayers),
		SessionCount:   len(room.registeredClients),
		LastActivityMs: room.Game.Tick,
		LastActivity:   lastActivity,
		Players:        players,
	}
}

func AdminListRooms() ([]AdminRoomSummary, GameError) {
	if store == nil {
		return nil, GameError{code: SERVER_ERROR, message: "store not initialized"}
	}

	roomCodes := store.currentRooms()
	sort.Strings(roomCodes)

	rooms := make([]AdminRoomSummary, 0, len(roomCodes))
	for _, roomCode := range roomCodes {
		foundRoom, storeError := store.getRoom(nil, roomCode)
		if storeError.code != "" {
			return nil, storeError
		}
		rooms = append(rooms, adminRoomSummary(foundRoom))
	}

	return rooms, GameError{}
}

func AdminEndRoom(roomCode string) GameError {
	if roomCode == "" {
		return GameError{code: PARSE_ERROR, message: "room code is required"}
	}

	foundRoom, storeError := store.getRoom(nil, roomCode)
	if storeError.code != "" {
		return storeError
	}

	return quitHost(&foundRoom, &Event{Room: roomCode})
}

func AdminEndAllRooms() (int, GameError) {
	roomCodes := store.currentRooms()
	sort.Strings(roomCodes)

	ended := 0
	for _, roomCode := range roomCodes {
		if gameError := AdminEndRoom(roomCode); gameError.code != "" {
			return ended, gameError
		}
		ended++
	}

	return ended, GameError{}
}

func AdminReconnectRooms() (int, GameError) {
	roomCodes := store.currentRooms()
	sent := 0

	for _, roomCode := range roomCodes {
		foundRoom, storeError := store.getRoom(nil, roomCode)
		if storeError.code != "" {
			return sent, storeError
		}

		message, err := NewSendData(foundRoom.Game)
		if err != nil {
			return sent, GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
		}
		foundRoom.Hub.broadcast <- message
		sent++
	}

	return sent, GameError{}
}

func AdminRoomsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rooms, gameError := AdminListRooms()
		if gameError.code != "" {
			writeAdminJSON(w, http.StatusInternalServerError, map[string]any{"success": false, "error": gameError.message})
			return
		}

		writeAdminJSON(w, http.StatusOK, map[string]any{
			"success":            true,
			"rooms":              rooms,
			"roomCreationPaused": isRoomCreationPaused(),
		})
	case http.MethodDelete:
		var request struct {
			RoomCode string `json:"roomCode"`
		}
		_ = json.NewDecoder(r.Body).Decode(&request)

		if request.RoomCode != "" {
			if gameError := AdminEndRoom(request.RoomCode); gameError.code != "" {
				writeAdminJSON(w, http.StatusBadRequest, map[string]any{"success": false, "error": gameError.message})
				return
			}
			writeAdminJSON(w, http.StatusOK, map[string]any{"success": true, "ended": 1})
			return
		}

		ended, gameError := AdminEndAllRooms()
		if gameError.code != "" {
			writeAdminJSON(w, http.StatusBadRequest, map[string]any{"success": false, "error": gameError.message, "ended": ended})
			return
		}

		writeAdminJSON(w, http.StatusOK, map[string]any{"success": true, "ended": ended})
	default:
		w.Header().Set("Allow", "GET, DELETE")
		writeAdminJSON(w, http.StatusMethodNotAllowed, map[string]any{"success": false, "error": "Method not allowed"})
	}
}

func AdminRoomCreationHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		writeAdminJSON(w, http.StatusOK, map[string]any{"success": true, "paused": isRoomCreationPaused()})
	case http.MethodPost:
		var request struct {
			Paused bool `json:"paused"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			writeAdminJSON(w, http.StatusBadRequest, map[string]any{"success": false, "error": "Invalid request body"})
			return
		}

		setRoomCreationPaused(request.Paused)
		writeAdminJSON(w, http.StatusOK, map[string]any{"success": true, "paused": isRoomCreationPaused()})
	default:
		w.Header().Set("Allow", "GET, POST")
		writeAdminJSON(w, http.StatusMethodNotAllowed, map[string]any{"success": false, "error": "Method not allowed"})
	}
}

func AdminReconnectRoomsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", "POST")
		writeAdminJSON(w, http.StatusMethodNotAllowed, map[string]any{"success": false, "error": "Method not allowed"})
		return
	}

	sent, gameError := AdminReconnectRooms()
	if gameError.code != "" {
		writeAdminJSON(w, http.StatusBadRequest, map[string]any{"success": false, "error": gameError.message, "rooms": sent})
		return
	}

	writeAdminJSON(w, http.StatusOK, map[string]any{"success": true, "roomsUpdated": sent})
}
