import BuzzerPopup from "@/components/BuzzerPopup";
import FinalPage from "@/components/FinalPage";
import QuestionBoard from "@/components/QuestionBoard";
import Round from "@/components/Round";
import TeamName from "@/components/TeamName";
import TitlePage from "@/components/Title/TitlePage.jsx";
import { ERROR_CODES } from "@/i18n/errorCodes";
import cookieCutter from "cookie-cutter";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

let timerInterval = null;

export default function Game() {
  const { i18n, t } = useTranslation();
  const [game, setGame] = useState({});
  const [timer, setTimer] = useState(0);
  const [showMistake, setShowMistake] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [buzzed, setBuzzed] = useState({});
  const ws = useRef(null);
  let refreshCounter = 0;

  useEffect(() => {
    if (game.is_final_round && game.final_round_timers) {
      const timerIndex = game.is_final_second ? 1 : 0;
      setTimer(game.final_round_timers[timerIndex]);
    }
  }, [game.is_final_round, game.is_final_second]);

  useEffect(() => {
    ws.current = new WebSocket(`wss://${window.location.host}/api/ws`);
    ws.current.onopen = function () {
      console.log("game connected to server");
      let session = cookieCutter.get("session");
      console.debug(session);
      if (session != null) {
        console.debug("found user session", session);
        ws.current.send(JSON.stringify({ action: "game_window", session: session }));
        setInterval(() => {
          console.debug("sending pong in game window");
          let [room, id] = session.split(":");
          ws.current.send(
            JSON.stringify({
              action: "pong",
              session: session,
              id: session.split(":")[1],
              room: session.split(":")[0],
            })
          );
        }, 5000);
      }
    };

    ws.current.onmessage = function (evt) {
      var received_msg = evt.data;
      let json = JSON.parse(received_msg);
      console.debug(json);
      if (json.action === "data") {
        if (Object.keys(buzzed).length === 0 && json.data.buzzed.length > 0) {
          let userId = json.data.buzzed[0].id;
          let user = json.data.registeredPlayers[userId];
          setBuzzed({
            id: userId,
            name: user.name,
            team: json.data.teams[user.team].name,
          });
        } else if (Object.keys(buzzed).length > 0 && json.data.buzzed.length === 0) {
          setBuzzed({});
        }
        if (json.data.title_text === "Change Me") {
          json.data.title_text = t("Change Me");
        }
        if (json.data.teams[0].name === "Team 1") {
          json.data.teams[0].name = `${t("team")} ${t("number", {
            count: 1,
          })}`;
        }
        if (json.data.teams[1].name === "Team 2") {
          json.data.teams[1].name = `${t("team")} ${t("number", {
            count: 2,
          })}`;
        }
        setGame(json.data);
        let session = cookieCutter.get("session");
        let [_, id] = session.split(":");
        if (json.data?.registeredPlayers[id] == "host") {
          setIsHost(true);
        }
      } else if (json.action === "mistake" || json.action === "show_mistake") {
        var audio = new Audio("wrong.mp3");
        audio.play();
        setShowMistake(true);
        setTimeout(() => {
          setShowMistake(false);
        }, 2000);
      } else if (json.action === "quit") {
        setGame({});
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
        clearInterval(timerInterval);
      } else if (json.action === "start_timer") {
        timerInterval = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer > 0) {
              return prevTimer - 1;
            } else {
              var audio = new Audio("try-again.mp3");
              audio.play();
              clearInterval(timerInterval);

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

                ws.current.send(
                  JSON.stringify({
                    action: "timer_complete",
                    room: room,
                    id: id,
                  })
                );
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

    setInterval(() => {
      if (ws.current.readyState !== 1) {
        toast.error(t(ERROR_CODES.CONNECTION_LOST, { message: `${5 - refreshCounter}` }));
        refreshCounter++;
        if (refreshCounter >= 5) {
          console.debug("game reload()");
          location.reload();
        }
      }
    }, 1000);
  }, []);

  if (game.teams != null) {
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
      gameSession = (
        <div className="flex flex-col space-y-10 px-10 py-20">
          <Round game={game} />
          <QuestionBoard round={game.rounds[game.round]} />
          <div className="flex flex-row justify-around">
            <TeamName game={game} team={0} />
            <TeamName game={game} team={1} />
          </div>
        </div>
      );
    }

    if (typeof window !== "undefined") {
      document.body.className = game?.settings?.theme + " bg-background";
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
        <div className={`${game?.settings?.theme} min-h-screen`}>
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
