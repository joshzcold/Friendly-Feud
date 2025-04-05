import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import AdminPage from "@/components/AdminPage";
import BuzzerPage from "@/components/BuzzerPage";
import Footer from "@/components/Login/Footer";
import LoginPage from "@/components/LoginPage";
import { ERROR_CODES } from "@/i18n/errorCodes";
import { Game } from "@/types/game";
// @ts-expect-error: not sure if cookie-cutter is typed
import cookieCutter from "cookie-cutter";
import { toast } from "sonner";

export default function Home() {
  const { t } = useTranslation();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [registeredRoomCode, setRegisteredRoomCode] = useState<string | null>("");
  const [host, setHost] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [team, setTeam] = useState<number | null>(null);
  const [playerID, setPlayerID] = useState<string | null>("");

  const ws = useRef<WebSocket | null>(null);

  /**
   * send quit message to server
   * server cleans up data on backend then
   * tells client to clean up
   */
  function quitGame(host = false) {
    if (ws.current) {
      ws.current.send(
        JSON.stringify({
          action: "quit",
          host: host,
          id: playerID,
          room: registeredRoomCode,
        })
      );
    } else {
      console.error("WebSocket connection is not open.");
    }
  }

  function startWsConnection() {
    ws.current = new WebSocket(`wss://${window.location.host}/api/ws`);
    ws.current.onopen = function () {
      console.debug("game connected to server", ws.current);
      if (ws.current) {
        ws.current.onmessage = function (evt: MessageEvent) {
          var received_msg = evt.data;
          let json = JSON.parse(received_msg);
          if (json.action === "host_room") {
            console.debug("registering room with host", json.room);
            setPlayerID(json.id);
            setHost(true);
            setRegisteredRoomCode(json.room);
            setGame(json.game);
            cookieCutter.set("session", `${json.room}:${json.id}`);
          } else if (json.action === "join_room") {
            console.debug("Joining room : ", json);
            setPlayerID(json.id);
            setRegisteredRoomCode(json.room);
            setGame(json.game);
            if (json.team != null) {
              setTeam(json.team);
            }
          } else if (json.action === "quit") {
            console.debug("player quit");
            setPlayerID(null);
            setRegisteredRoomCode(null);
            cookieCutter.set("session", "");
            setGame(null);
            setHost(false);
          } else if (json.action === "get_back_in") {
            console.debug("Getting back into room", json);
            if (json.host === true) {
              setHost(true);
            }
            if (Number.isInteger(json.team)) {
              setTeam(json.team);
            }
            setPlayerID(json.id);
            setRegisteredRoomCode(json.room);
            setGame(json.game);
          } else if (json.action === "error") {
            console.error(json);
            toast.error(t(json.code, { message: json.message }));
            if (json.code === "errors.room_not_found") {
              // Clear stale session data so that the user isn't continuously reconnected using an invalid session
              setPlayerID(null);
              setRegisteredRoomCode(null);
              setGame(null);
              setHost(false);
              cookieCutter.set("session", "");
            }
          } else if (json.action === "ping") {
            console.debug("index.js: ping");
          } else {
            console.debug("did not expect in index.js: ", json);
          }
        };

        ws.current.onerror = function (e: Event) {
          console.error(e);
        };
      }
    };
  }

  function waitForSocketConnection(socket: WebSocket | null, callback: () => void, tries = 0) {
    setTimeout(function () {
      if (socket && socket.readyState === 1) {
        if (callback != null) {
          callback();
        }
      } else {
        console.debug("wait for connection...");
        tries++;
        if (tries > 30) {
          toast.error(t(ERROR_CODES.UNABLE_TO_CONNECT));
          return;
        }
        waitForSocketConnection(socket, callback, tries);
      }
    }, 100); // wait 100 milisecond for the connection...
  }

  /**
   * put initalization logic inside send method
   * this is make sure the websocket connection
   * doesn't stay idleing while a player is sitting
   * on the main page
   */
  function send(message: string) {
    console.debug("send", ws);
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.debug("connecting to server... new connection");
      startWsConnection();
      waitForSocketConnection(ws.current, function () {
        if (ws.current) {
          ws.current.send(message);
        } else {
          console.error("WebSocket connection is not open after waiting.");
        }
      });
    } else {
      console.debug("send", message);
      ws.current.send(message);
    }
  }

  /**
   * on page refresh check for existing session
   * if it exists then tell the server to send back
   * the game object
   */
  useEffect(() => {
    let session = cookieCutter.get("session");
    console.debug("user session", session);
    if (session != "" && session != null) {
      send(JSON.stringify({ action: "get_back_in", session: session }));
    }
  }, []);

  function hostRoom() {
    send(
      JSON.stringify({
        action: "host_room",
      })
    );
  }

  /**
   * tell server to join a game
   * do some validation on inputs
   */
  function joinRoom() {
    console.debug(`ws.current `, ws);
    const roomCodeInput = document.getElementById("roomCodeInput") as HTMLInputElement;
    const playerNameInput = document.getElementById("playerNameInput") as HTMLInputElement;
    if (roomCodeInput && roomCodeInput.value.length === 4) {
      if (playerNameInput && playerNameInput.value.length > 0) {
        console.debug(`roomcode: ${roomCodeInput.value}, playername ${playerNameInput.value}`);
        send(
          JSON.stringify({
            action: "join_room",
            room: roomCodeInput.value.toUpperCase(),
            name: playerNameInput.value,
          })
        );
      } else {
        toast.error(t(ERROR_CODES.MISSING_INPUT, { message: t("name") }));
      }
    } else {
      toast.error(t("room code is not correct length, should be 4 characters"));
    }
  }

  // control what to render based on if the player is hosting
  function getPage() {
    if (registeredRoomCode !== null && host && game != null) {
      return (
        <div className="w-full lg:flex lg:flex-row lg:justify-center">
          <div className="sm:w-full md:w-full lg:w-3/4">
            <AdminPage
              ws={ws}
              game={game}
              playerId={playerID}
              setGame={setGame}
              room={registeredRoomCode}
              quitGame={quitGame}
            />
          </div>
        </div>
      );
    } else if (registeredRoomCode !== null && !host && game != null) {
      return (
        <div className="flex w-full justify-center">
          <div className="flex w-11/12 flex-col space-y-3 pt-5 sm:w-10/12 md:w-3/4 lg:w-1/2">
            <BuzzerPage
              ws={ws}
              game={game}
              id={playerID}
              setGame={setGame}
              room={registeredRoomCode}
              quitGame={quitGame}
              setTeam={setTeam}
              team={team}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative flex min-h-screen w-full justify-center">
          <div className="flex w-full flex-col sm:px-4 md:px-8 lg:w-1/2 lg:px-6">
            <LoginPage
              setRoomCode={setRoomCode}
              roomCode={roomCode}
              setPlayerName={setPlayerName}
              playerName={playerName}
              joinRoom={joinRoom}
              hostRoom={hostRoom}
            />
          </div>
          <Footer />
        </div>
      );
    }
  }

  if (typeof window !== "undefined") {
    document.body.className = (game?.settings?.theme ?? "default") + " bg-background";
  }
  return (
    <>
      <Head>
        <title>{t("Friendly Feud")}</title>
        <meta name="author" content="Joshua Cold" />
        <meta
          name="description"
          content="Free to play open source friendly feud game. Host your own custom created family feud games with built in online buzzers, timers and admin controls. Visit https://github.com/joshzcold/Cold-Friendly-Feud to check out the source code and contribute."
        />
      </Head>
      <main>
        <div
          style={{
            width: "100vh",
          }}
          className={`${game?.settings?.theme ?? "default"} h-screen w-screen`}
        >
          {/* TODO put in the theme switcher and put setting here */}
          {getPage()}
        </div>
      </main>
    </>
  );
}
