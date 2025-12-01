module github.com/joshzcold/Cold-Friendly-Feud

go 1.25

replace github.com/joshzcold/Cold-Friendly-Feud => ./

require (
	github.com/google/uuid v1.6.0
	github.com/gorilla/websocket v1.5.3
	golang.org/x/text v0.31.0
	gorm.io/datatypes v1.2.7
	gorm.io/driver/sqlite v1.6.0
	gorm.io/gorm v1.31.1
)

require (
	filippo.io/edwards25519 v1.1.0 // indirect
	github.com/go-sql-driver/mysql v1.9.3 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/mattn/go-sqlite3 v1.14.32 // indirect
	gorm.io/driver/mysql v1.6.0 // indirect
)
