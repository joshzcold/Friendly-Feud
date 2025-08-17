import BuzzerPopup from "@/components/BuzzerPopup";
import FinalPage from "@/components/FinalPage";
import QuestionBoard from "@/components/QuestionBoard";
import Round from "@/components/Round";
import TeamName from "@/components/TeamName";
import TitlePage from "@/components/Title/TitlePage";
import { ERROR_CODES } from "@/i18n/errorCodes";
import { BuzzedState, Game } from "@/types/game";
// @ts-expect-error: not sure if cookie-cutter is typed
import cookieCutter from "cookie-cutter";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

let timerInterval: NodeJS.Timeout | null = null;

export default function GamePage() {
  const { i18n, t } = useTranslation();
  const [game, setGame] = useState<Game | null>(null);
  const [timer, setTimer] = useState(0);
  const [showMistake, setShowMistake] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [buzzed, setBuzzed] = useState<BuzzedState>({});
  const ws = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshCounterRef = useRef(0);

  useEffect(() => {
    if (game?.is_final_round && game.final_round_timers) {
      const timerIndex = game.is_final_second ? 1 : 0;
      setTimer(game.final_round_timers[timerIndex]);
    }
  }, [game?.is_final_round, game?.is_final_second, game?.final_round_timers]);

  useEffect(() => {
    ws.current = new WebSocket(`wss://${window.location.host}/api/ws`);
    ws.current.onopen = function () {
      console.log("game connected to server");
      let session = cookieCutter.get("session");
      console.debug(session);
      if (session != null && ws.current) {
        console.debug("found user session", session);
        ws.current.send(JSON.stringify({ action: "game_window", session: session }));

        const pingInterval = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            console.debug("sending pong in game window");
            const sessionParts = session?.split(":");
            if (sessionParts?.length === 2) {
              const [room, id] = sessionParts;
              ws.current.send(
                JSON.stringify({
                  action: "pong",
                  session: session,
                  id: id,
                  room: room,
                })
              );
            } else {
              console.error("Invalid session format for pong:", session);
            }
          } else {
            clearInterval(pingInterval);
          }
        }, 5000);

        return () => clearInterval(pingInterval);
      }
    };

    ws.current.onmessage = function (evt) {
      var received_msg = evt.data;
      let json;
      try {
        json = JSON.parse(received_msg);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        return;
      }

      console.debug(json);
      if (json.action === "data") {
        const newGameData: Game = json.data;

        if (Object.keys(buzzed).length === 0 && newGameData.buzzed.length > 0) {
          const buzzerInfo = newGameData.buzzed[0];
          const user = newGameData.registeredPlayers[buzzerInfo.id];
          if (user && newGameData.teams[user.team ?? 0]) {
            setBuzzed({
              id: buzzerInfo.id,
              name: user.name,
              team: newGameData.teams[user.team ?? 0].name,
            });
          } else {
            console.warn("Buzzed user or team not found:", buzzerInfo, newGameData);
            setBuzzed({});
          }
        } else if (Object.keys(buzzed).length > 0 && newGameData.buzzed.length === 0) {
          setBuzzed({});
        }

        if (newGameData.title_text === "Change Me") {
          newGameData.title_text = t("Change Me");
        }
        if (newGameData.teams[0]?.name === "Team 1") {
          newGameData.teams[0].name = `${t("team")} ${t("number", {
            count: 1,
          })}`;
        }
        if (newGameData.teams[1]?.name === "Team 2") {
          newGameData.teams[1].name = `${t("team")} ${t("number", {
            count: 2,
          })}`;
        }

        setGame(newGameData);

        let session = cookieCutter.get("session");
        let sessionParts;
        if (session) {
          sessionParts = session.split(":");
        } else {
          console.error("No session cookie found");
          return;
        }
        if (sessionParts.length === 2) {
          const [_, id] = sessionParts;
          setIsHost(newGameData.host.id === id);
        }
      } else if (json.action === "mistake" || json.action === "show_mistake") {
        var audio = new Audio("wrong.mp3");
        audio.play();
        setShowMistake(true);
        setTimeout(() => {
          setShowMistake(false);
        }, 2000);
      } else if (json.action === "quit") {
        setGame(null);
        window.close();
      } else if (json.action === "reveal") {
        var audio = new Audio("good-answer.mp3");
        audio.play();
      } else if (json.action === "final_reveal") {
        var audio = new Audio("fm-answer-reveal.mp3");
        audio.play();
      } else if (json.action === "duplicate") {
        var audio = new Audio("duplicate.mp3");
        audio.play();
      } else if (json.action === "final_submit") {
        var audio = new Audio("good-answer.mp3");
        audio.play();
      } else if (json.action === "final_wrong") {
        var audio = new Audio("try-again.mp3");
        audio.play();
      } else if (json.action === "set_timer") {
        setTimer(json.data);
      } else if (json.action === "stop_timer") {
        if (timerInterval) {
          clearInterval(timerInterval);
        }
      } else if (json.action === "start_timer") {
        timerInterval = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer > 0) {
              return prevTimer - 1;
            } else {
              var audio = new Audio("try-again.mp3");
              audio.play();

              if (timerInterval) {
                clearInterval(timerInterval);
              }

              // Send timer stop to admin.js
              try {
                let session = cookieCutter.get("session");
                let [room, id] = session.split(":");

                if (!session) {
                  console.error("No session cookie found");
                  return 0;
                }

                if (!room || !id) {
                  console.error("Invalid session cookie format");
                  return 0;
                }

                if (ws.current?.readyState === WebSocket.OPEN) {
                  ws.current.send(
                    JSON.stringify({
                      action: "timer_complete",
                      room: room,
                      id: id,
                    })
                  );
                } else {
                  console.warn("WebSocket not open when trying to send timer_complete");
                }
              } catch (error) {
                console.error("Error processing session cookie:", error);
              }
              return 0;
            }
          });
        }, 1000);
      } else if (json.action === "change_lang") {
        console.debug("Language Change", json.data);
        i18n.changeLanguage(json.data);
      } else if (json.action === "timer_complete") {
        console.debug("Timer complete");
      } else if (json.action === "clearbuzzers") {
        console.debug("Clear buzzers");
        setBuzzed({});
      } else {
        console.error("didn't expect", json);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error(t(ERROR_CODES.CONNECTION_LOST));
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
    };

    refreshCounterRef.current = 0;
    refreshIntervalRef.current = setInterval(() => {
      if (ws.current?.readyState !== WebSocket.OPEN) {
        refreshCounterRef.current++;
        const remainingSeconds = Math.max(0, 5 - refreshCounterRef.current);
        toast.error(t(ERROR_CODES.CONNECTION_LOST, { message: `${remainingSeconds}` }));
        if (refreshCounterRef.current >= 5) {
          console.debug("game reload()");
          if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
          location.reload();
        }
      } else {
        refreshCounterRef.current = 0;
      }
    }, 1000);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (timerInterval) clearInterval(timerInterval);
      ws.current?.close();
    };
  }, []);

  if (game?.teams != null) {
    let gameSession;
    if (game.title) {
      gameSession = <TitlePage game={game} />;
    } else if (game.is_final_round) {
      gameSession = (
        <div className="flex w-full justify-center">
          <div className="flex w-11/12 flex-col space-y-6 py-20 sm:w-11/12 sm:px-8 md:w-4/6 lg:w-5/6">
            <FinalPage game={game} timer={timer} />
          </div>
        </div>
      );
    } else {
      const currentRoundData = game.rounds && game.rounds[game.round];
      if (!currentRoundData) {
        console.error("Invalid round index or missing round data:", game.round, game.rounds);
        gameSession = <div>Error: Invalid round data</div>;
      } else {
        gameSession = (
          <div className="flex flex-col space-y-10 px-10 py-20">
            <Round game={game} />
            <QuestionBoard round={currentRoundData} />
            <div className="flex flex-row justify-around">
              <TeamName game={game} team={0} />
              <TeamName game={game} team={1} />
            </div>
          </div>
        );
      }
    }

    if (typeof window !== "undefined") {
      document.body.className = (game?.settings?.theme ?? "default") + " bg-background";
    }
    return (
      <>
        {!isHost ? (
          <div className="absolute flex w-screen flex-col items-end">
            <button
              className="m-1 rounded-lg bg-secondary-500 p-2 font-bold uppercase shadow-md hover:bg-secondary-200"
              onClick={() => {
                cookieCutter.set("session", "");
                window.location.href = "/";
              }}
            >
              {t("quit")}
            </button>
          </div>
        ) : null}
        <div className="pointer-events-none absolute">
          <Image
            id="xImg"
            width={1000}
            height={1000}
            className={`pointer-events-none fixed inset-0 z-50 p-24 ${
              showMistake ? "opacity-90" : "opacity-0"
            } transition-opacity duration-300 ease-in-out`}
            src="/x.png"
            alt="Mistake indicator"
            aria-hidden={!showMistake}
          />
        </div>
        <div className={`${game?.settings?.theme ?? "default"} min-h-screen`}>
          <div className="">{gameSession}</div>
        </div>
        <BuzzerPopup buzzed={buzzed} />
      </>
    );
  } else {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-10">
        <p>{t("No game session. retry from the admin window")}</p>
        <button
          className="m-1 rounded-lg bg-secondary-500 p-2 font-bold uppercase shadow-md hover:bg-secondary-200"
          id="quitButton"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          {t("quit")}
        </button>
      </div>
    );
  }
}
