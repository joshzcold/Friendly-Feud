package api

type GameError struct {
	code    ErrorCode
	message string
}

type ErrorCode string

const (
	ROOM_NOT_FOUND           ErrorCode = "errors.room_not_found"
	PARSE_ERROR              ErrorCode = "errors.parse_error"
	GAME_CLOSED              ErrorCode = "errors.game_closed"
	HOST_QUIT                ErrorCode = "errors.host_quit"
	IMAGE_TOO_LARGE          ErrorCode = "errors.image_too_large"
	CSV_TOO_LARGE            ErrorCode = "errors.csv_too_large"
	CSV_INVALID_FORMAT       ErrorCode = "errors.csv_invalid_format"
	UNKNOWN_FILE_TYPE        ErrorCode = "errors.unknown_file_type"
	SERVER_ERROR             ErrorCode = "errors.server_error"
	BUZZER_REGISTER_ERROR    ErrorCode = "errors.buzzer_register"
	SPECTATOR_REGISTER_ERROR ErrorCode = "errors.spectator_register"
	CHANGE_LANG_ERROR        ErrorCode = "errors.change_lang"
	CONNECTION_LOST          ErrorCode = "errors.connection_lost"
	MISSING_INPUT            ErrorCode = "errors.missing_input"
	UNABLE_TO_CONNECT        ErrorCode = "errors.unable_to_connect"
	PLAYER_NOT_FOUND         ErrorCode = "errors.player_not_found"
	FORBIDDEN                ErrorCode = "errors.forbidden"
)
