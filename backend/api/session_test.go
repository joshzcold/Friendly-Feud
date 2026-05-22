package api

import (
	"testing"
	"time"
)

func TestInitalizeRoomAllowsNilClientForAdminReattach(t *testing.T) {
	room := InitalizeRoom(nil, "TEST")
	defer close(room.cleanup)
	defer func() {
		select {
		case room.Hub.stop <- true:
		case <-time.After(time.Second):
			t.Fatal("timed out stopping hub")
		}
	}()

	select {
	case room.Hub.broadcast <- []byte("admin reattach smoke test"):
	case <-time.After(time.Second):
		t.Fatal("timed out broadcasting after nil-client room initialization")
	}
}
