package api

import (
	"encoding/json"
	"fmt"
)

type Event struct {
	// Main decider in function
	Action string `json:"action"`

	// supplemental fields
	File     string `json:"file"`
	Lang     string `json:"lang"`
	Data     any    `json:"data"`
	LogoData string `json:"logoData"`
	Room     string `json:"room"`
	Name     string `json:"name"`
	Host     bool   `json:"host"`
	ID       string `json:"id"`
	Session  string `json:"session"`
	Team     *int    `json:"team"`
	MimeType string `json:"mimetype"`
}

type ActionFunc func(*Client, *Event) error

var recieveActions = map[string]func(client *Client, event *Event) GameError {
	"buzz":              Buzz,
	"change_lang":       ChangeLanguage,
	"clearbuzzers":      ClearBuzzers,
	"data":              NewData,
	"del_logo_upload":   DeleteLogoUpload,
	"game_window":       GameWindow,
	"get_back_in":       GetBackIn,
	"host_room":         HostRoom,
	"join_room":         JoinRoom,
	"load_game":         LoadGame,
	"logo_upload":       LogoUpload,
	"pong":              Pong,
	"quit":              Quit,
	"registerbuzz":      RegisterBuzzer,
	"registerspectator": RegisterSpectator,
	"unknown":           SendUnknown,
}

func parseEvent(message []byte) (*Event, error) {
	var event *Event
	err := json.Unmarshal(message, &event)
	if err != nil {
		return nil, err
	}
	return event, nil
}

func EventPipe(client *Client, message []byte) GameError {
	event, err := parseEvent(message)
	if err != nil {
		return GameError{code: PARSE_ERROR, message: fmt.Sprint(err)}
	}
	if event.Action != "" {
		if event.Action != "pong" && event.Action != "buzz" {
			setTick(client, event)
		}
		action, ok := recieveActions[event.Action]
		if ok {
			return action(client, event)
		}
		// Catch all for generic messages coming from admin
		return recieveActions["unknown"](client, event)
	}
	return GameError{}
}
