package api

import (
	"encoding/json"
	"fmt"
)

type Event struct {
	// Main decider in function
	Action string `json:"action"`

	// supplemental fields
	File         string `json:"file"`
	Lang         string `json:"lang"`
	Data         any    `json:"data"`
	LogoData     string `json:"logoData"`
	Room         string `json:"room"`
	Name         string `json:"name"`
	Host         bool   `json:"host"`
	ID           string `json:"id"`
	HostPassword string `json:"hostPassword"`
	Session      string `json:"session"`
	Team         *int   `json:"team"`
	MimeType     string `json:"mimetype"`
}

type ActionFunc func(*Client, *Event) GameError

// Actions can be done by player and host
var recieveActions = map[string]ActionFunc{
	"buzz":              Buzz,
	"change_lang":       ChangeLanguage,
	"data":              NewData,
	"game_window":       GameWindow,
	"get_back_in":       GetBackIn,
	"host_room":         HostRoom,
	"join_room":         JoinRoom,
	"pong":              Pong,
	"quit":              Quit,
	"registerbuzz":      RegisterBuzzer,
	"registerspectator": RegisterSpectator,
	"unknown":           SendUnknown,
}

// Actions that require a host password
var hostRecieveActions = map[string]ActionFunc{
	"del_logo_upload":        DeleteLogoUpload,
	"logo_upload":            LogoUpload,
	"register_buzzer_screen": RegisterBuzzerScreen,
	"buzzer_screen_buzz":     BuzzerScreenBuzz,
	"load_game":              LoadGame,
	"clearbuzzers":           ClearBuzzers,
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
		action, ok = hostRecieveActions[event.Action]
		if ok {
			return HostPasswordHandler(client, event, action)
		}
		// Catch all for generic messages coming from admin
		return recieveActions["unknown"](client, event)
	}
	return GameError{}
}
