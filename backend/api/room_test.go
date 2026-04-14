package api

import "testing"

func TestRoomCodeUsesOnlyUnambiguousCharacters(t *testing.T) {
	ambiguousCharacters := map[rune]bool{
		'I': true,
		'L': true,
		'O': true,
	}

	for i := 0; i < 1000; i++ {
		code := roomCode()
		if len(code) != roomLetterLength {
			t.Fatalf("roomCode() length = %d, want %d", len(code), roomLetterLength)
		}

		for _, character := range code {
			if ambiguousCharacters[character] {
				t.Fatalf("roomCode() generated ambiguous character %q in %q", character, code)
			}
		}
	}
}
