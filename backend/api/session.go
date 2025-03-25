package api

import (
	"fmt"
	"log"
	"slices"
	"strings"
)

func quitPlayer(room *room, client *Client, event *Event) error {
    playerClient, ok := room.registeredClients[event.ID]
	if !ok {
        return fmt.Errorf("player not found")
    }

    hostClient, hostExists := room.registeredClients[room.Game.Host.ID]
    
    isHost := false
    if hostExists {
        isHost = hostClient.client == client
    }
    isPlayer := playerClient.client == client
	
    // Allow quitting if:
    // 1. Player is quitting themselves
    // 2. Client is the host
    // 3. No host exists (orphaned room)
    if !isPlayer && !isHost && hostExists {
        return fmt.Errorf("forbidden")
    }

	for idx, b := range room.Game.Buzzed {
		if b.ID == event.ID {
			// Remove from buzzed player list
			room.Game.Buzzed = append(room.Game.Buzzed[:idx], room.Game.Buzzed[idx+1:]...)
		}
	}

	message, err := NewSendQuit()
	if err != nil {
		return fmt.Errorf(" %w", err)
	}
	if playerClient != nil {
		playerClient.client.send <- message
		playerClient.client.stop <- true
	}
	delete(room.Game.RegisteredPlayers, event.ID)
	message, err = NewSendData(room.Game)
	if err != nil {
		return fmt.Errorf(" %w", err)
	}
	room.Hub.broadcast <- message
	return nil
}

func quitHost(room *room, event *Event) GameError {
	s := store
	// Make everyone else quit
	message, err := NewSendQuit()
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	room.Hub.broadcast <- message

	message, err = NewSendError(GameError{code: HOST_QUIT})
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	if room.Hub.broadcast != nil {
		room.Hub.broadcast <- message
	}
	if room.Hub.stop != nil {
		room.Hub.stop <- true
	}
	// Signal cleanup channel to stop the room timeout goroutine
	if room.cleanup != nil {
		close(room.cleanup)
	}
	// Remove room
	s.deleteRoom(event.Room)
	s.deleteLogo(event.Room)
	return GameError{}
}

// Quit clear sessions for user or host
func Quit(client *Client, event *Event) GameError {
	log.Println("user quit game", event.Room, event.ID, event.Host)
	s := store
	room, storeError := s.getRoom(client, event.Room)
	if storeError.code != "" {
		return storeError
	}
	if event.Host {
		return quitHost(&room, event)
	}
	err := quitPlayer(&room, client, event)
	s.writeRoom(room.Game.Room, room)
	if err != nil {
		if err.Error() == "forbidden" {
			return GameError{code: FORBIDDEN}
		}
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	return GameError{}
}

func JoinRoom(client *Client, event *Event) GameError {
	s := store
	room, storeError := s.getRoom(client, event.Room)
	if storeError.code != "" {
		return storeError
	}
	playerID := registerPlayer(&room, event.Name, client)
	room.Hub.register <- client
	message, err := NewSendJoinRoom(room.Game.Room, room.Game, playerID)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	client.send <- message
	s.writeRoom(event.Room, room)
	return GameError{}
}

func InitalizeRoom(client *Client, newRoomCode string) room {
	initRoom := NewGame(newRoomCode)
	initRoom.Hub = NewHub()
	go initRoom.Hub.run()
	go initRoom.gameTimeout()
	initRoom.Hub.register <- client
	return initRoom
}

// HostRoom create new room and websocket hub
func HostRoom(client *Client, event *Event) GameError {
	newRoomCode := roomCode()
	s := store
	currentRooms := s.currentRooms()
	for slices.Contains(currentRooms, newRoomCode) {
		newRoomCode = roomCode()
	}
	initRoom := InitalizeRoom(client, newRoomCode)
	hostID := registerHost(&initRoom, client)
	message, err := NewSendHostRoom(newRoomCode, initRoom.Game, hostID)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	client.send <- message
	s.writeRoom(newRoomCode, initRoom)
	return GameError{}
}

func getBackInHost(client *Client, room room, roomCode string, playerID string) GameError {
	room.Hub.register <- client
	message, err := NewSendGetBackIn(roomCode, room.Game, playerID, registeredPlayer{}, true)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	client.send <- message
	return GameError{}
}

func getBackInPlayer(client *Client, room room, roomCode string, playerID string) GameError {
	player, ok := room.Game.RegisteredPlayers[playerID]
	if !ok {
		return GameError{code: PLAYER_NOT_FOUND}
	}
	room.Hub.register <- client
	message, err := NewSendGetBackIn(roomCode, room.Game, playerID, *player, false)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	client.send <- message

	playerClient, ok := room.registeredClients[playerID]
	if ok {
		if playerClient.client.stop != nil {
			playerClient.client.stop <- true
		}
	}
	playerClient = &RegisteredClient{
		id:       playerID,
		client:   client,
		room:     &room,
	}
	go playerClient.pingInterval()
	room.registeredClients[playerID] = playerClient

	return GameError{}
}

func GetBackIn(client *Client, event *Event) GameError {
	session := strings.Split(event.Session, ":")
	if len(session) < 2 {
		return GameError{code: PARSE_ERROR}
	}
	roomCode, playerID := session[0], session[1]
	s := store
	room, storeError := s.getRoom(client, roomCode)
	if storeError.code != "" {
		return storeError
	}
	if playerID == room.Game.Host.ID {
		return getBackInHost(client, room, roomCode, playerID)
	}
	return getBackInPlayer(client, room, roomCode, playerID)
}

func registerPlayer(room *room, playerName string, client *Client) string {
	playerID := playerID()
	room.Game.RegisteredPlayers[playerID] = &registeredPlayer{
		Name: playerName,
		Team: nil,
	}
	room.registeredClients[playerID] = &RegisteredClient{
		id:     playerID,
		client: client,
		room:   room,
	}
	log.Println("Registered player in room: ", playerName, playerID, room.Game.Room)

	return playerID
}

// registerHost Set current player as host
func registerHost(room *room, client *Client) string {
	hostID := playerID()
	room.Game.Host = host{
		ID: hostID,
	}

	room.registeredClients[hostID] = &RegisteredClient{
		id:     hostID,
		client: client,
		room:   room,
	}

	log.Println("Registered host in room: ", hostID, room.Game.Room)
	store.writeRoom(room.Game.Room, *room)
	return hostID
}
