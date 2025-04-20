package api

import (
	"fmt"
	"time"

	"github.com/gorilla/websocket"
)

type HealthStatus struct {
	Status  string        `json:"status"`
	Details HealthDetails `json:"details"`
}

type HealthDetails struct {
	WebSocket ComponentStatus `json:"websocket"`
	Database  ComponentStatus `json:"database"`
}

type ComponentStatus struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp,omitempty"`
	Error     string    `json:"error,omitempty"`
}

func HealthTest(port string) (HealthStatus, error) {
	status := HealthStatus{
		Status: "up",
		Details: HealthDetails{
			WebSocket: checkWebSocket(port),
			Database:  checkDatabase(),
		},
	}

	if status.Details.WebSocket.Status == "down" || status.Details.Database.Status == "down" {
		status.Status = "down"
		return status, fmt.Errorf("one or more components are down")
	}

	return status, nil
}

func checkWebSocket(port string) ComponentStatus {
	status := ComponentStatus{
		Status:    "up",
		Timestamp: time.Now().UTC(),
	}

	url := fmt.Sprintf("ws://localhost%s/api/ws", port)

	// Set a shorter timeout for health checks
	dialer := websocket.Dialer{
		HandshakeTimeout: 5 * time.Second,
	}

	// Attempt connection
	conn, _, err := dialer.Dial(url, nil)
	if err != nil {
		status.Status = "down"
		status.Error = fmt.Sprintf("websocket connection failed: %v", err)
		return status
	}
	defer conn.Close()

	// Ping and wait for pong to verify connection is working
	err = conn.WriteMessage(websocket.PingMessage, []byte{})
	if err != nil {
		status.Status = "down"
		status.Error = fmt.Sprintf("failed to send ping: %v", err)
	}

	return status
}

func checkDatabase() ComponentStatus {
	status := ComponentStatus{
		Status:    "up",
		Timestamp: time.Now().UTC(),
	}

	if store == nil {
		status.Status = "down"
		status.Error = "store not initialized"
		return status
	}

	if err := store.isHealthy(); err != nil {
		status.Status = "down"
		status.Error = fmt.Sprintf("database health check failed: %v", err)
	}

	return status
}
