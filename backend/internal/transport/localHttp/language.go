package api

import (
	"fmt"
	"path/filepath"

	"golang.org/x/text/collate"
	"golang.org/x/text/language"
)

func ChangeLanguage(client *Client, event *Event) GameError {
	gamePath := filepath.Join("games", fmt.Sprint(event.Data), "**/*.json")
	gameList, err := filepath.Glob(gamePath)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	s := store
	room, storeError := s.getRoom(client, event.Room)
	if storeError.code != "" {
		return storeError
	}
	cull := collate.New(
		language.English,
		collate.IgnoreCase,
		collate.IgnoreDiacritics,
		collate.IgnoreWidth,
		collate.Loose,
		collate.Force,
		collate.Numeric,
	)
	cull.SortStrings(gameList)
	message, err := NewSendChangeLang(fmt.Sprint(event.Data), gameList)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	room.Hub.broadcast <- message
	return GameError{}
}
