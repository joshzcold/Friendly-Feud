package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

// addGameKeys Add state data to a loaded game
func addGameKeys(game *game) error {
	if len(game.Rounds) == 0 {
		return errors.New(string(PARSE_ERROR))
	}
	game.PointTracker = []int{}
	for _, round := range game.Rounds {
		if len(round.Answers) == 0 {
			return errors.New(string(PARSE_ERROR))
		}
		game.PointTracker = append(game.PointTracker, 0)
	}
	return nil
}

func LoadGame(client *Client, event *Event) GameError {
	s := store
	room, storeError := s.getRoom(client, event.Room)
	if storeError.code != "" {
		return storeError
	}
	gameBytes, err := json.Marshal(event.Data)
	loadedGame := game{}
	if event.File != "" {
		filePath := filepath.Join(event.File)
		_, err = os.Stat(filePath)
		if err != nil {
			return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
		}
		gameBytes, err = os.ReadFile(filePath)
	}
	json.Unmarshal(gameBytes, &loadedGame)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	room.Game.FinalRound = loadedGame.FinalRound
	room.Game.FinalRound2 = loadedGame.FinalRound
	room.Game.FinalRoundTimers = loadedGame.FinalRoundTimers
	room.Game.Rounds = loadedGame.Rounds

	err = addGameKeys(room.Game)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	message, err := NewSendData(room.Game)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	room.Hub.broadcast <- message
	s.writeRoom(event.Room, room)
	return GameError{}
}
