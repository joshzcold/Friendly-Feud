package api

import (
	"log"
	"time"
)

type host struct {
	ID string `json:"id"`
}

// TODO put any client or goroutine data outside of game data.
type registeredPlayer struct {
	Start     time.Time `json:"start"`
	Latencies []int64   `json:"latencies"`
	// Allow team to be set to null in json
	Team    *int    `json:"team"`
	Latency float64 `json:"latency"`
	Name    string  `json:"name"`
	Hidden  bool    `json:"hidden"`
}

type buzzed struct {
	Time int64  `json:"time"`
	ID   string `json:"id"`
}

type settings struct {
	LogoUrl              any    `json:"logo_url"`
	HideQuestions        bool   `json:"hide_questions"`
	Theme                string `json:"theme"`
	FinalRoundTitle      any    `json:"final_round_title"`
	PlayerBuzzerSound    bool   `json:"player_buzzer_sound"`
	FirstBuzzerSoundOnly bool   `json:"first_buzzer_sound_only"`
}

type team struct {
	Name     string `json:"name"`
	Points   int    `json:"points"`
	Mistakes int    `json:"mistakes"`
}

type answer struct {
	Triggered bool   `json:"trig"`
	Answer    string `json:"ans"`
	Points    int    `json:"pnt"`
}

type round struct {
	Answers  []answer `json:"answers"`
	Multiply int      `json:"multiply"`
	Question string   `json:"question"`
}

type finalRound struct {
	Answers   []any  `json:"answers"`
	Questions string `json:"question"`
	Selection int    `json:"selection"`
	Points    int    `json:"points"`
	Input     string `json:"input"`
	Revealed  bool   `json:"revealed"`
}

type game struct {
	Room              string                       `json:"room"`
	RegisteredPlayers map[string]*registeredPlayer `json:"registeredPlayers"`
	Host              host                         `json:"host"`
	Buzzed            []buzzed                     `json:"buzzed"`
	Settings          settings                     `json:"settings"`
	Teams             []team                       `json:"teams"`
	Title             bool                         `json:"title"`
	TitleText         string                       `json:"title_text"`
	PointTracker      []int                        `json:"point_tracker"`
	IsFinalRound      bool                         `json:"is_final_round"`
	IsFinalSecond     bool                         `json:"is_final_second"`
	HideFirstRound    bool                         `json:"hide_first_round"`
	Round             int                          `json:"round"`
	Rounds            []round                      `json:"rounds"`
	FinalRound        []finalRound                 `json:"final_round"`
	FinalRound2       []finalRound                 `json:"final_round_2"`
	FinalRoundTimers  []int                        `json:"final_round_timers"`
	Tick              int64                        `json:"tick"`
	RoundStartTime    int64                        `json:"round_start_time"`
}

func setTick(client *Client, event *Event) GameError {
	room, storeError := store.getRoom(client, event.Room)
	if storeError.code != "" {
		return storeError
	}
	room.Game.Tick = time.Now().UTC().UnixMilli()
	log.Println("Set tick for room", room.Game.Room, room.Game.Tick)
	store.writeRoom(room.Game.Room, room)
	return GameError{}
}

func NewGame(roomCode string) room {
	return room{
		roomConnections: roomConnections{
			Hub:               nil,
			registeredClients: make(map[string]*RegisteredClient),
		},
		Game: &game{
			Room:              roomCode,
			RegisteredPlayers: make(map[string]*registeredPlayer),
			Buzzed:            []buzzed{},
			Settings: settings{
				LogoUrl:         nil,
				HideQuestions:   true,
				Theme:           "default",
				FinalRoundTitle: nil,
			},
			Teams: []team{
				{
					Name:     "Team 1",
					Points:   0,
					Mistakes: 0,
				},
				{
					Name:     "Team 2",
					Points:   0,
					Mistakes: 0,
				},
			},
			Title:          true,
			TitleText:      "",
			PointTracker:   []int{},
			IsFinalRound:   false,
			IsFinalSecond:  false,
			HideFirstRound: false,
			Round:          0,
			Tick:           time.Now().UTC().UnixMilli(),
			RoundStartTime: time.Now().UTC().UnixMilli(),
		},
		cleanup: make(chan struct{}),
	}
}
