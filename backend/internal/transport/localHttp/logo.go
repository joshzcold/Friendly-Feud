package api

import (
	"encoding/base64"
	"errors"
	"fmt"
	"math"
	"net/http"
	"slices"
)

const MaxFileSize = 2098

func VerifyLogo(logo []byte) error {
	fileSize := math.Round(float64(len(logo) / 1024))
	if fileSize > MaxFileSize {
		return fmt.Errorf("image too large")
	}
	mimeType := http.DetectContentType(logo)
	acceptedMimeTypes := []string{"image/png", "image/gif", "image/jpeg"}

	if !slices.Contains(acceptedMimeTypes, mimeType) {
		return errors.New(string(UNKNOWN_FILE_TYPE))
	}
	return nil
}

func LogoUpload(client *Client, event *Event) GameError {
	s := store
	base64DecodedLogoData, err := base64.StdEncoding.DecodeString(event.LogoData)
	if err != nil {
		return GameError{code: SERVER_ERROR, message: fmt.Sprint(err)}
	}
	storeError := s.saveLogo(event.Room, base64DecodedLogoData)
	if storeError.code != "" {
		return storeError
	}
	return GameError{}
}

func DeleteLogoUpload(client *Client, event *Event) GameError {
	s := store
	storeError := s.deleteLogo(event.Room)
	if storeError.code != "" {
		return storeError
	}
	return GameError{}
}

func FetchLogo(w http.ResponseWriter, roomCode string) GameError {
	s := store
	logoData, storeError := s.loadLogo(roomCode)
	if storeError.code != "" {
		w.WriteHeader(404)
		return storeError
	}
	w.WriteHeader(200)
	w.Write(logoData)
	return GameError{}
}
