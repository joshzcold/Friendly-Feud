package api

import (
	"time"
	"strings"
)

func Pong(client *Client, event *Event) GameError {
	s := store
	room, storeError := s.getRoom(client, event.Room)
	if storeError.code != "" {
		return storeError
	}

    // Check if this is a spectator session (ends with :0)
    if strings.HasSuffix(event.Session, ":0") {
        return GameError{}  // Silently accept pongs from spectators
    }

	player, ok := room.Game.RegisteredPlayers[event.ID]
	if ! ok {
		return GameError{code: PLAYER_NOT_FOUND}
	}
	if ! player.Start.IsZero() {
		end := time.Now()
		latency := end.Sub(player.Start)
		for len(player.Latencies) >= 5 {
			player.Latencies = player.Latencies[1:]
		}
		player.Latencies = append(player.Latencies, latency.Milliseconds())
		var total int64
		for _, val := range player.Latencies {
			total += val
		}
		// Average latency
		player.Latency = float64(total / int64(len(player.Latencies)))
	}
	return GameError{}
}
