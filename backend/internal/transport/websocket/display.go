package localHttp

import (
	"fmt"
	"strings"

	"github.com/joshzcold/Cold-Friendly-Feud/internal/errors"
)

func GameWindow(client *Client, event *Event) errors.GameError {
	session := strings.Split(event.Session, ":")
	if len(session) < 2 {
		return errors.GameError{Code: errors.PARSE_ERROR}
	}

	roomCode := session[0]
	if roomCode == "" {
		return errors.GameError{Code: errors.PARSE_ERROR}
	}

	s := store
	room, storeError := s.getRoom(client, roomCode)
	if storeError.code != "" {
		return storeError
	}

	message, err := NewSendData(room.Game)
	if err != nil {
		return errors.GameError{Code: errors.SERVER_ERROR, Message: fmt.Sprint(err)}
	}
	room.Hub.register <- client
	room.Hub.broadcast <- message
	return errors.GameError{}
}
