import HostBuzzersPage from "@/components/HostBuzzersPage";
import { ERROR_CODES } from "@/i18n/errorCodes";
import { Game, WSAction, WSEvent } from "@/types/game";
// @ts-expect-error: not sure if cookie-cutter is typed
import cookieCutter from "cookie-cutter";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import NoSession from "../components/ui/NoSession";

export default function BuzzersPage() {
  const { t } = useTranslation();
  const ws = useRef<WebSocket | null>(null);
  const [hostPassword, setHostPassword] = useState<string>("");
  const [game, setGame] = useState<Game | null>(null);
  const [buzzerRegistered, setBuzzersRegistered] = useState<boolean>(false);
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const roomCode = urlParams.get("room");
  const [buzzed, setBuzzed] = useState<boolean>(false);
  const hasRoom = !!roomCode;

  function send(data: any) {
    console.debug("Sending", data);

    if (ws.current) {
      ws.current.send(JSON.stringify({ ...data, hostPassword: hostPassword, room: roomCode }));
      return;
    }
    toast.error(t(ERROR_CODES.CONNECTION_LOST));
  }

  useEffect(() => {
    ws.current = new WebSocket(`wss://${window.location.host}/api/ws`);
    ws.current.onopen = function () {
      console.log("game connected to server");
      let session = cookieCutter.get("session");
      console.debug(session);
      if (session != null && ws.current) {
        ws.current.send(JSON.stringify({ action: "game_window", session: session }));
      }
    };

    ws.current.onmessage = function (evt) {
      var received_msg = evt.data;
      let json: WSEvent;
      try {
        json = JSON.parse(received_msg);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        return;
      }

      console.log(json);
      switch (json.action) {
        case WSAction.DATA:
          setGame(json.data);
          break;

        case WSAction.REGISTER_BUZZER_SCREEN:
          setBuzzersRegistered(true);
          break;

        case WSAction.BUZZED:
          setBuzzed(true);
          break;

        case WSAction.CLEARBUZZERS:
          setBuzzed(false);
          break;

        case WSAction.QUIT:
          console.debug("player quit");
          cookieCutter.set("session", "");
          setGame(null);
          setHostPassword("");
          break;

        case WSAction.ERROR:
          setHostPassword("");
          toast.error(t(json.code, { message: json.message }));
          break;

        default:
          console.error("didn't expect", json);
          break;
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error(t(ERROR_CODES.CONNECTION_LOST));
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
    };
  }, []);
  if (typeof window !== "undefined") {
    document.body.className = (game?.settings?.theme ?? "default") + " bg-background";
  }

  if (!hasRoom) {
    return <NoSession />;
  }

  return (
    <>
      {!buzzerRegistered ? (
        <div>
          <div className="absolute flex min-w-full justify-end px-10 pt-10">
            <button
              id="quitButton"
              className="text-1xl z-50 w-24 self-end rounded-lg bg-secondary-900 p-2 font-bold uppercase shadow-md hover:bg-secondary-300"
              onClick={() => {
                cookieCutter.set("session", "");
                window.location.href = "/";
              }}
            >
              {t("quit")}
            </button>
          </div>
          <div className="flex min-h-screen flex-col items-center justify-center space-y-10">
            <p className="text-xl capitalize text-foreground">{t("enter in host password")}</p>
            <input
              id="buzzersPasswordInput"
              onChange={(e) => {
                setHostPassword(e.target.value);
              }}
              className="rounded-md border-2 border-secondary-900 bg-secondary-300 p-3 text-foreground"
              value={hostPassword}
            />
            <button
              id="buzzersSubmitButton"
              onClick={() => {
                send({ action: WSAction.REGISTER_BUZZER_SCREEN.valueOf() });
              }}
              className="rounded-md bg-primary-200 p-2 text-lg"
            >
              {t("Submit")}
            </button>
          </div>
        </div>
      ) : game?.teams != null ? (
        <HostBuzzersPage game={game} send={send} buzzed={buzzed} />
      ) : (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-foreground">{t("loading")}</p>
        </div>
      )}
    </>
  );
}
