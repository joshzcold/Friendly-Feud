package api

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func withMemoryStore(t *testing.T) *MemoryStore {
	t.Helper()

	previousStore := store
	memoryStore := NewMemoryStore()
	store = memoryStore
	t.Cleanup(func() {
		store = previousStore
	})

	return memoryStore
}

func TestAdminAuthMiddleware(t *testing.T) {
	t.Setenv("ADMIN_CONSOLE_PASSWORD", "secret")

	called := false
	handler := AdminAuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusNoContent)
	})

	unauthorizedRequest := httptest.NewRequest(http.MethodPost, "/api/internal/admin/rooms", nil)
	unauthorizedResponse := httptest.NewRecorder()
	handler(unauthorizedResponse, unauthorizedRequest)

	if unauthorizedResponse.Code != http.StatusUnauthorized {
		t.Fatalf("expected unauthorized status, got %d", unauthorizedResponse.Code)
	}
	if called {
		t.Fatal("next handler should not be called for unauthorized requests")
	}

	authorizedRequest := httptest.NewRequest(http.MethodPost, "/api/internal/admin/rooms", nil)
	authorizedRequest.Header.Set("X-Admin-Password", "secret")
	authorizedResponse := httptest.NewRecorder()
	handler(authorizedResponse, authorizedRequest)

	if authorizedResponse.Code != http.StatusNoContent {
		t.Fatalf("expected authorized status, got %d", authorizedResponse.Code)
	}
	if !called {
		t.Fatal("next handler should be called for authorized requests")
	}
}

func TestAdminRoomsHandlerRejectsMalformedDeleteBody(t *testing.T) {
	memoryStore := withMemoryStore(t)
	room := InitalizeRoom(nil, "ABCD")
	if gameError := memoryStore.writeRoom("ABCD", room); gameError.code != "" {
		t.Fatalf("failed to write room: %s", gameError.message)
	}
	t.Cleanup(func() {
		close(room.cleanup)
		room.Hub.stop <- true
	})

	request := httptest.NewRequest(http.MethodDelete, "/api/internal/admin/rooms", strings.NewReader("{bad json"))
	response := httptest.NewRecorder()

	AdminRoomsHandler(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected malformed body to return 400, got %d", response.Code)
	}
	if _, gameError := memoryStore.getRoom(nil, "ABCD"); gameError.code != "" {
		t.Fatal("malformed delete body should not delete rooms")
	}
}

func TestAdminRoomsHandlerAllowsEmptyDeleteBodyForEndAll(t *testing.T) {
	memoryStore := withMemoryStore(t)
	room := InitalizeRoom(nil, "ABCD")
	if gameError := memoryStore.writeRoom("ABCD", room); gameError.code != "" {
		t.Fatalf("failed to write room: %s", gameError.message)
	}
	t.Cleanup(func() {
		if _, gameError := memoryStore.getRoom(nil, "ABCD"); gameError.code == "" {
			close(room.cleanup)
			room.Hub.stop <- true
		}
	})

	request := httptest.NewRequest(http.MethodDelete, "/api/internal/admin/rooms", nil)
	response := httptest.NewRecorder()

	AdminRoomsHandler(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected empty body to end all rooms, got %d", response.Code)
	}
	if _, gameError := memoryStore.getRoom(nil, "ABCD"); gameError.code == "" {
		t.Fatal("empty delete body should delete all rooms")
	}
}

func TestAdminRoomCreationHandlerBranches(t *testing.T) {
	setRoomCreationPaused(false)
	t.Cleanup(func() {
		setRoomCreationPaused(false)
	})

	invalidRequest := httptest.NewRequest(http.MethodPost, "/api/internal/admin/room-creation", strings.NewReader("{bad json"))
	invalidResponse := httptest.NewRecorder()
	AdminRoomCreationHandler(invalidResponse, invalidRequest)
	if invalidResponse.Code != http.StatusBadRequest {
		t.Fatalf("expected invalid body to return 400, got %d", invalidResponse.Code)
	}

	postRequest := httptest.NewRequest(http.MethodPost, "/api/internal/admin/room-creation", strings.NewReader(`{"paused":true}`))
	postResponse := httptest.NewRecorder()
	AdminRoomCreationHandler(postResponse, postRequest)
	if postResponse.Code != http.StatusOK {
		t.Fatalf("expected pause request to return 200, got %d", postResponse.Code)
	}
	if !isRoomCreationPaused() {
		t.Fatal("expected room creation to be paused")
	}

	methodRequest := httptest.NewRequest(http.MethodDelete, "/api/internal/admin/room-creation", nil)
	methodResponse := httptest.NewRecorder()
	AdminRoomCreationHandler(methodResponse, methodRequest)
	if methodResponse.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected unsupported method to return 405, got %d", methodResponse.Code)
	}
}
