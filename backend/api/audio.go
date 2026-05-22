package api

import (
	"encoding/base64"
	"errors"
	"fmt"
	"math"
	"net/http"
)

const MaxAudioFileSize = 2098

func VerifyAudio(audio []byte) error {
	fileSize := math.Round(float64(len(audio) / 1024))
	if fileSize > MaxAudioFileSize {
		return fmt.Errorf("audio too large")
	}

	mimeType := http.DetectContentType(audio)
	if mimeType != "audio/mpeg" {
		return errors.New(string(UNKNOWN_FILE_TYPE))
	}

	return nil
}

func TitleMusicUpload(client *Client, event *Event) GameError {
	s := store
	base64DecodedAudioData, err := base64.StdEncoding.DecodeString(event.AudioData)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}

	storeError := s.saveTitleMusic(event.Room, base64DecodedAudioData)
	if storeError.code != "" {
		return storeError
	}

	return GameError{}
}

func DeleteTitleMusicUpload(client *Client, event *Event) GameError {
	s := store
	storeError := s.deleteTitleMusic(event.Room)
	if storeError.code != "" {
		return storeError
	}

	return GameError{}
}

func FetchTitleMusic(w http.ResponseWriter, roomCode string) GameError {
	s := store
	titleMusicData, storeError := s.loadTitleMusic(roomCode)
	if storeError.code != "" {
		w.WriteHeader(404)
		return storeError
	}

	w.Header().Set("Content-Type", "audio/mpeg")
	w.WriteHeader(200)
	w.Write(titleMusicData)
	return GameError{}
}
