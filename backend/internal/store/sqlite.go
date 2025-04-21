package store

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"sync"

	"gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	internalErrors "github.com/joshzcold/Cold-Friendly-Feud/internal/errors"
	"github.com/joshzcold/Cold-Friendly-Feud/internal/room"
)

type SQLiteStore struct {
	// Keep game data in storage
	db    *gorm.DB
	rooms map[string]room.RoomConnections
	mu    sync.RWMutex
}

type Room struct {
	gorm.Model
	RoomCode string `gorm:"primaryKey"`
	RoomJson datatypes.JSON
	RoomIcon []byte
}

func NewSQLiteStore() (*SQLiteStore, internalErrors.GameError) {
	storePath := "famf.db"
	if envPath := os.Getenv("GAME_STORE_SQLITE_PATH"); envPath != "" {
		storePath = envPath
	}
	log.Println("Using sqlite store path", storePath)
	db, err := gorm.Open(sqlite.Open(storePath), &gorm.Config{})
	if err != nil {
		return &SQLiteStore{}, internalErrors.GameError{Code: internalErrors.SERVER_ERROR, Message: fmt.Sprint(err)}
	}
	db.AutoMigrate(&Room{})
	return &SQLiteStore{
		db:    db,
		rooms: make(map[string]room.RoomConnections),
	}, internalErrors.GameError{}
}

func (s *SQLiteStore) ListRooms() []string {
	var rooms []Room
	var roomList []string
	s.db.Model(&Room{}).Select("room_code").Find(&rooms)

	for _, r := range rooms {
		roomList = append(roomList, r.RoomCode)
	}
	return roomList
}

func (s *SQLiteStore) GetGame(roomCode string) (*game.Game, internalErrors.GameError) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var foundRoomDB Room

	if err := s.db.Where("room_code = ?", roomCode).First(&foundRoomDB).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return room.Room{}, internalErrors.GameError{Code: internalErrors.ROOM_NOT_FOUND}
	}
	_, ok := s.rooms[roomCode]

	// Reattach to the game creating a new hub
	if !ok && roomCode != "" {
		log.Println("getRoom recreating roomConnections map")
		initRoom := room.InitalizeRoom(client, roomCode)
		s.rooms[roomCode] = initRoom.roomConnections
	}

	foundRoom := s.rooms[roomCode]
	retrievedRoom := room.Room{
		Game: &game.Room{},
		RoomConnections: room.RoomConnections{
			Hub:               foundRoom.Hub,
			RegisteredClients: foundRoom.RegisteredClients,
		},
	}
	json.Unmarshal(foundRoomDB.RoomJson, &retrievedRoom.Game)

	return retrievedRoom, internalErrors.GameError{}
}

func (s *SQLiteStore) SaveGame(roomCode string, room *game.Game) internalErrors.GameError {
	s.mu.Lock()
	defer s.mu.Unlock()
	jsonData, err := json.Marshal(room)
	if err != nil {
		return internalErrors.GameError{Code: internalErrors.SERVER_ERROR, Message: fmt.Sprint(err)}
	}
	if err := s.db.Where("room_code = ?", roomCode).First(&Room{}).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		newRoom := Room{
			RoomCode: roomCode,
			RoomJson: jsonData,
		}
		s.db.Create(&newRoom)
		s.rooms[roomCode] = room.RoomConnections{}
		return internalErrors.GameError{}
	}
	s.db.Model(&Room{}).Where("room_code = ?", roomCode).Update("room_json", jsonData)
	s.rooms[roomCode] = room.RoomConnections{}
	return internalErrors.GameError{}
}

func (s *SQLiteStore) DeleteGame(roomCode string) internalErrors.GameError {
	log.Println("Try to delete room", roomCode)
	s.db.Unscoped().Where("room_code = ?", roomCode).Delete(&Room{})
	return internalErrors.GameError{}
}

func (s *SQLiteStore) SaveLogo(roomCode string, logo []byte) internalErrors.GameError {
	s.db.Model(&Room{}).Where("room_code = ?", roomCode).Update("room_icon", logo)
	return internalErrors.GameError{}
}

func (s *SQLiteStore) LoadLogo(roomCode string) ([]byte, internalErrors.GameError) {
	var foundRoomDB Room

	if err := s.db.Where("room_code = ?", roomCode).First(&foundRoomDB).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, internalErrors.GameError{Code: internalErrors.SERVER_ERROR, Message: "logo not found"}
	}
	return foundRoomDB.RoomIcon, internalErrors.GameError{}
}

func (s *SQLiteStore) DeleteLogo(roomCode string) internalErrors.GameError {
	s.db.Model(&Room{}).Where("room_code = ?", roomCode).Update("room_icon", nil)
	return internalErrors.GameError{}
}

func (s *SQLiteStore) IsHealthy() error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %v", err)
	}
	
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %v", err)
	}

	if !s.db.Migrator().HasTable(&Room{}) {
		return fmt.Errorf("rooms table does not exist")
	}
	
	return nil
}
