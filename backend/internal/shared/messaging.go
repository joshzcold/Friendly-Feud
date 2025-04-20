package api

import (
	"encoding/json"
)

type sendData struct {
	Action string `json:"action"`
	Data   *game  `json:"data"`
}

func NewSendData(newGameData *game) ([]byte, error) {
	return json.Marshal(sendData{
		Action: "data",
		Data:   newGameData,
	})
}

type sendError struct {
	Action  string `json:"action"`
	Code ErrorCode `json:"code"`
	Message string `json:"message"`
}

func NewSendError(ge GameError) ([]byte, error) {
	return json.Marshal(sendError{
		Action:  "error",
		Code: ge.code,
		Message: ge.message,
	})
}

type sendPing struct {
	Action string `json:"action"`
	Id     string `json:"id"`
}

func NewSendPing(id string) ([]byte, error) {
	return json.Marshal(sendPing{
		Action: "ping",
		Id:     id,
	})
}

type sendHostRoom struct {
	Action string `json:"action"`
	Room   string `json:"room"`
	Game   *game  `json:"game"`
	ID     string `json:"id"`
}

func NewSendHostRoom(room string, game *game, id string) ([]byte, error) {
	return json.Marshal(sendHostRoom{
		Action: "host_room",
		Room:   room,
		Game:   game,
		ID:     id,
	})
}

type sendJoinRoom struct {
	Action string `json:"action"`
	Room   string `json:"room"`
	Game   *game  `json:"game"`
	ID     string `json:"id"`
}

func NewSendJoinRoom(room string, game *game, id string) ([]byte, error) {
	return json.Marshal(sendJoinRoom{
		Action: "join_room",
		Room:   room,
		Game:   game,
		ID:     id,
	})
}

type sendQuit struct {
	Action string `json:"action"`
}

func NewSendQuit() ([]byte, error) {
	return json.Marshal(sendQuit{
		Action: "quit",
	})
}

type sendGetBackIn struct {
	Action string           `json:"action"`
	Room   string           `json:"room"`
	Game   *game            `json:"game"`
	ID     string           `json:"id"`
	Player registeredPlayer `json:"player"`
	Host   bool             `json:"host"`
}

func NewSendGetBackIn(room string, game *game, id string, player registeredPlayer, host bool) ([]byte, error) {
	return json.Marshal(sendGetBackIn{
		Action: "get_back_in",
		Room:   room,
		Game:   game,
		ID:     id,
		Player: player,
		Host:   host,
	})
}

type sendClearBuzzers struct {
	Action string `json:"action"`
}

func NewSendClearBuzzers() ([]byte, error) {
	return json.Marshal(sendClearBuzzers{
		Action: "clearbuzzers",
	})
}

type sendRegistered struct {
	Action string `json:"action"`
	Id     string `json:"id"`
}

func NewSendRegistered(id string) ([]byte, error) {
	return json.Marshal(sendRegistered{
		Action: "registered",
		Id:     id,
	})
}

type sendChangeLang struct {
	Action string   `json:"action"`
	Data   string   `json:"data"`
	Games  []string `json:"games"`
}

func NewSendChangeLang(language string, games []string) ([]byte, error) {
	return json.Marshal(sendChangeLang{
		Action: "change_lang",
		Data:   language,
		Games:  games,
	})
}

type sendBuzzed struct {
	Action string `json:"action"`
}

func NewSendBuzzed() ([]byte, error) {
	return json.Marshal(sendBuzzed{
		Action: "buzzed",
	})
}

type sendLogo struct {
	Logo string `json:"logo"`
}

func NewSendLogo(logo string) ([]byte, error) {
	return json.Marshal(sendLogo{
		Logo: logo,
	})
}
