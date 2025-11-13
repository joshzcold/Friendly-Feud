# Doing Development on Friendly Feud

## Table of Contents
1. [Project Structure](#project-structure)
2. [Dependencies](#dependencies)
3. [Setup Instructions](#setup-instructions)
4. [Quick Start](#quick-start)
5. [Running Development](#running-development)
6. [End-to-End Testing](#end-to-end-testing)
7. [Frontend Overview](#frontend-overview)
8. [Backend Overview](#backend-overview)
9. [Troubleshooting](#troubleshooting)
10. [Contributing Guidelines](#contributing-guidelines)

## Project Structure
```plaintext
├── backend/               # Golang backend
│   ├── api/               # Backend API and websocket logic
│   ├── Dockerfile         # Backend Dockerfile
│   ├── main.go            # Entry point for backend server
├── docker/                # Docker and nginx configuration files
│   ├── allinone/          # All-in-one Docker configuration
│   ├── nginx/             # Nginx configuration
│   └── docker-compose*.yaml # Docker compose files
├── doc/                   # Documentation and development guide
├── e2e/                   # End-to-end tests using Playwright
├── games/                 # Pre-built game files in JSON format
├── i18n/                  # Localization and translation files
├── public/                # Static assets (images, fonts, etc.)
├── scripts/               # Utility scripts for game creation
├── Dockerfile             # Frontend dockerfile
├── Dockerfile.allinone    # All-in-one dockerfile
├── src/                   # Next.js frontend
│   ├── components/        # React components
│   ├── lib/               # Utility functions
│   ├── pages/             # Next.js page components
```


## Dependencies

### System Requirements

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (version specified in `.nvmrc`)
- [Go](https://go.dev/doc/install)
- [Make](https://www.gnu.org/software/make/)

## Setup Instructions

### Windows Setup

For Windows users, we recommend using WSL.

You might need to configure Windows firewall to allow WSL network access:
```powershell
# Add outbound rules
netsh advfirewall firewall add rule name="WSL2 HTTPS Out" dir=out action=allow protocol=TCP localport=443
netsh advfirewall firewall add rule name="WSL2 HTTP Out" dir=out action=allow protocol=TCP localport=80
# Add inbound rules
netsh advfirewall firewall add rule name="WSL2 HTTPS" dir=in action=allow protocol=TCP localport=443
netsh advfirewall firewall add rule name="WSL2 HTTP" dir=in action=allow protocol=TCP localport=80
```

### Linux Setup

Install dependencies

## Quick Start
1. Install dependencies
2. Clone the repository
3. Start development environment:
   ```bash
   make dev
   ```
4. Access the application at [localhost](https://localhost/)

## Running development
The stack consists of:

- `frontend`: Next.js
- `backend`: Golang
- `proxy`: Nginx as the entry point

The development environment is managed through a Makefile. Key commands include:

- `make dev`: Builds and starts the development stack
- `make dev-background`: Same as `make dev`, but detaches
- `make dev-down`: Stops/removes the development stack

Access the application at [localhost/](https://localhost/)

The compose files should automatically be selected by the Makefile, but you can:
- check out the [Linux version](../docker/docker-compose.yaml) if on Linux or Macos
- check out the [WSL version](../docker/docker-compose-dev-wsl.yaml) if on Windows

## End-to-End Testing

`make e2e-ui` will launch [playwright](https://playwright.dev/)

The e2e tests are located in the [e2e](../e2e/) folder.

Tests are marked with their `*.spec.js` file name

## Frontend Overview
The frontend is using `Next.js` as its way to serve pages.

[Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)

Code is arranged in the [./src](../src/) folder with [./src/pages/index.jsx](../src/pages/index.jsx) being the entry point

From there you can expect the usual React functionality.

The `frontend` connects back to the `backend` via the `nginx` proxy to setup a WebSocket connection that will control its behavior when data comes in.

We store a cookie to keep the user's session in the game as they refresh the page.

### Working with styles

You can use anything from [TailwindCSS](https://tailwindcss.com/) as long as the colors you use match the colors found in  [tailwind.config.js](../tailwind.config.js)

```js
// ....
success: {
    900: "#14532D",
    700: "#15803D",
    500: "#22C55E",
    300: "#86EFAC",
    200: "#BBF7D0",
},
secondary: {
    900: "#A1A1AA",
    700: "#D4D4D8",
    500: "#E4E4E7",
    300: "#F4F4F5",
    200: "#FAFAFA",
},
// ....
```

This looks like

```html
<div className="rounded bg-success-200 p-2">{t("Answer")} 1</div>
<div className="rounded bg-primary-200 p-2">{t("points")} 1</div>
```

What this does is setup a "Theme" we use for the theme picker for the game, so make sure you use the colors named in that configuration file.

## Backend Overview

The backend is a `Golang` application located in [./backend](../backend/).

The entry point is `main.go`, where we start our WebSocket server:

```go
http.HandleFunc("/api/ws", func(httpWriter http.ResponseWriter, httpRequest *http.Request) {
    api.ServeWs(httpWriter, httpRequest)
})
```

We also set up a "store" that backend functions interact with to store game data:

```go
err := api.NewGameStore(cfg.store)

func NewGameStore(gameStore string) error {
	switch gameStore {
	case "memory":
		log.Println("Starting famf with memory store")
		store = NewMemoryStore()
		return nil
	case "sqlite":
		log.Println("Starting famf with sqlite store")
		store, _ = NewSQLiteStore()
	default:
		return fmt.Errorf("unknown store: %q", gameStore)
	}
	return nil
}
```

The variable `store` is used by functions to read and write game state:

```go
var store gameStore
```

This setup creates a connection to the frontend and establishes two [goroutines](https://go.dev/tour/concurrency/1) that asynchronously read and write to the client:

```go
go client.writePump()
go client.readPump()
```

In `readPump()`, we receive messages and pass them to `EventPipe()`.

`EventPipe()` is located in [backend/api/pipe.go](../backend/api/pipe.go) and serves as the next entry point for handling events from the frontend.

We parse messages like these in the `parseEvent()` function:

```json
{ "action": "buzz", "room": "HL6T", "id": "fds-fds-21-fds-f-321"}
{ "action": "clearbuzzers", "room": "HL6T"}
```

```go
func parseEvent(message []byte) (*Event, error) {
	var event *Event
	err := json.Unmarshal(message, &event)
	if err != nil {
		return nil, err
	}
	return event, nil
}
```

If the action exists in the `receiveActions` map, we call the corresponding function.

Backend functions typically follow this pattern:

1. Retrieve data from the store for the specified room
2. Perform actions on the data
3. Send updated data to the player or the entire room
4. Write changes back to the store

When you see code like this:

```go
client.send <- message
```

or

```go
if room.Hub.broadcast != nil {
    room.Hub.broadcast <- message
}
if room.Hub.stop != nil {
    room.Hub.stop <- true
}
```

We're sending data back to goroutines initialized when the player connects or when a [Hub](../backend/api/hub.go) is created for the room.

### Writing a new Store

Creating a new game store is straightforward.

The Go interface in [backend/api/store.go](../backend/api/store.go) defines the required functions:

```go
type gameStore interface {}
```

For a simple example, see the memory store in [backend/api/store-memory.go](../backend/api/store-memory.go), which uses a `map` to store game data.

> Note: Production deployments currently use the `sqlite` store.

When you see:

```go
m.mu.RLock()
defer m.mu.RUnlock()
```

This lock prevents race conditions when accessing memory in asynchronous goroutines.


## Troubleshooting

1. If localhost doesn't work, try using `127.0.0.1` instead. On Windows with WSL, verify with `curl localhost`
2. For WebSocket issues:
   - Verify the backend is running
3. If node_modules aren't updating:
   ```sh
   make dev-down
   make dev
   ```

## Contributing Guidelines
We welcome contributions! Please follow these guidelines:
1. Fork the repository and create your branch from `master`
2. Follow the existing code style and architecture
3. Write commit messages using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
4. Add tests for new features
5. Update documentation when making changes
6. Open a pull request with a detailed description
