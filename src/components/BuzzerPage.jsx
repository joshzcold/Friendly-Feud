import TitleLogo from "@/components/TitleLogo";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import FinalPage from "@/components/FinalPage";
import QuestionBoard from "@/components/QuestionBoard";
import Round from "@/components/Round";
import TeamName from "@/components/TeamName";
import { ERROR_CODES } from "@/i18n/errorCodes";
import cookieCutter from "cookie-cutter";
import { EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

let timerInterval = null;

export default function BuzzerPage(props) {
  const { i18n, t } = useTranslation();
  const [buzzed, setBuzzed] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showMistake, setShowMistake] = useState(false);
  let refreshCounter = 0;

  let game = props.game;
  let ws = props.ws;

  const send = function (data) {
    data.room = props.room;
    data.id = props.id;
    ws.current.send(JSON.stringify(data));
  };

  const playBuzzerSound = () => {
    const audio = new Audio("buzzer.wav");
    audio.play().catch((error) => {
      console.warn("Error playing buzzer sound:", error);
    });
  };

  useEffect(() => {
    cookieCutter.set("session", `${props.room}:${props.id}:0`);
    setInterval(() => {
      if (ws.current.readyState !== 1) {
        toast.error(t(ERROR_CODES.CONNECTION_LOST, { message: `${5 - refreshCounter}` }));
        refreshCounter++;
        if (refreshCounter >= 10) {
          console.debug("buzzer reload()");
          location.reload();
        }
      }
    }, 1000);

    ws.current.addEventListener("message", (evt) => {
      let received_msg = evt.data;
      let json = JSON.parse(received_msg);
      if (json.action === "ping") {
        // server gets the average latency periodically
        console.debug(props.id);
        send({ action: "pong", id: props.id });
      } else if (json.action === "mistake" || json.action === "show_mistake") {
        var audio = new Audio("wrong.mp3");
        audio.play();
        if (json.action === "mistake" || json.action === "show_mistake") {
          setShowMistake(true);
          setTimeout(() => {
            setShowMistake(false);
          }, 2000);
        }
      } else if (json.action === "quit") {
        props.setGame(null);
        props.setTeam(null);
        location.reload();
      } else if (json.action === "set_timer") {
        setTimer(json.data);
      } else if (json.action === "stop_timer") {
        clearInterval(timerInterval);
      } else if (json.action === "start_timer") {
        let limit = json.data;
        timerInterval = setInterval(() => {
          if (limit > 0) {
            limit = limit - 1;
            setTimer(limit);
          } else {
            clearInterval(timerInterval);
            setTimer(json.data);
          }
        }, 1000);
      } else if (json.action === "data") {
        if (json.data.title_text === "Change Me") {
          json.data.title_text = t("Change Me");
        }
        if (json.data.teams[0].name === "Team 1") {
          json.data.teams[0].name = `${t("team")} ${t("number", { count: 1 })}`;
        }
        if (json.data.teams[1].name === "Team 2") {
          json.data.teams[1].name = `${t("team")} ${t("number", { count: 2 })}`;
        }
        props.setGame(json.data);
      } else if (json.action === "buzzed") {
        setBuzzed(true);
      } else if (json.action === "clearbuzzers") {
        setBuzzed(false);
      } else if (json.action === "change_lang") {
        console.debug("Language Change", json.data);
        i18n.changeLanguage(json.data);
      } else if (json.action === "registered") {
        console.debug(props.id);
        send({ action: "pong", id: props.id });
      } else {
        console.debug("didnt expect action in buzzer: ", json);
      }
    });
  }, []);

  const currentPlayer = game.registeredPlayers[props.id];
  if (currentPlayer?.hidden)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-foreground">
        <EyeOff />
        <h1 id="playerBlindFoldedText">{t("You have been blindfolded...")}</h1>
      </div>
    );
  if (game.teams != null) {
    return (
      <>
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
        <button
          id="quitButton"
          className="text-1xl z-50 w-24 self-end rounded-lg bg-secondary-900 p-2 font-bold uppercase shadow-md hover:bg-secondary-300"
          onClick={() => {
            send({ action: "quit" });
          }}
        >
          {t("quit")}
        </button>
        {props.id in game.registeredPlayers && game.registeredPlayers[props.id].team !== null ? (
          <>
            {!game.title && !game.is_final_round ? (
              <div className="flex flex-col space-y-5 pt-8">
                <Round game={game} />

                {/* Buzzer Section TODO replace with function*/}
                <div className="w-full text-center">
                  {buzzed || game.buzzed.map((a) => a.id).includes(props.id) ? (
                    <Image
                      className="inline-block w-1/2"
                      id="buzzerButtonPressed"
                      width={500}
                      height={200}
                      alt="Buzzer Button"
                      src="/buzzed.svg"
                    />
                  ) : (
                    <Image
                      id="buzzerButton"
                      width={500}
                      height={200}
                      className="inline-block w-1/2 cursor-pointer"
                      onClick={() => {
                        send({ action: "buzz", id: props.id });
                        // Play sound based on settings
                        if (game.settings.player_buzzer_sound) {
                          if (!game.settings.first_buzzer_sound_only || game.buzzed.length === 0) {
                            playBuzzerSound();
                          }
                        }
                      }}
                      src="/buzz.svg"
                      alt="Buzzer Button Pressed"
                    />
                  )}
                  <p className="p-2 italic text-secondary-900">{t("buzzer is reset between rounds")}</p>
                </div>
                {/* END Buzzer Section TODO replace with function*/}
                <div className="flex min-w-full flex-row justify-between space-x-3">
                  <TeamName game={game} team={0} />
                  <TeamName game={game} team={1} />
                </div>
                <div className="">
                  <QuestionBoard round={game.rounds[game.round]} />
                </div>
                <div className="w-full grow space-y-2 rounded border-4 text-center">
                  <div className="flex flex-col">
                    {game.buzzed.map((x, i) => (
                      <div
                        key={`buzzer-${x.id}-${i}`}
                        className="text-1xl flex flex-row space-x-2 md:text-2xl lg:text-2xl"
                      >
                        <div className="grow">
                          <p id={`buzzedList${i}Name`} className="w-20 truncate text-left text-foreground">
                            {t("number", { count: i + 1 })}. {game.registeredPlayers[x.id].name}
                          </p>
                        </div>
                        <div className="grow">
                          <p id={`buzzedList${i}TeamName`} className="w-20 truncate text-left text-foreground">
                            {game.teams[game.registeredPlayers[x.id].team].name}
                          </p>
                        </div>
                        <div className="grow">
                          <p id={`buzzedList${i}Time`} className="w-20 truncate text-left text-foreground">
                            {t("number", {
                              count: (((x.time - game.tick) / 1000) % 60).toFixed(2),
                            })}{" "}
                            {t("second")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {game.is_final_round ? (
                  <div>
                    <FinalPage game={game} timer={timer} />
                  </div>
                ) : (
                  <div>
                    {props.game.settings.logo_url ? (
                      <div className="flex justify-center">
                        <Image
                          width={300}
                          height={300}
                          style={{ objectFit: "contain" }}
                          src={`${props.game.settings.logo_url}?v=${Date.now()}`}
                          alt="Game logo"
                          priority // Load image immediately
                          unoptimized // Skip caching
                        />
                      </div>
                    ) : (
                      <TitleLogo insert={props.game.title_text} />
                    )}
                    <p id="waitingForHostText" className="py-12 text-center text-3xl text-foreground">
                      {t("Waiting for host to start")}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {props.game.settings.logo_url ? (
              <div className="mx-auto w-full max-w-md">
                <Image
                  id="titleLogoUserUploaded"
                  width={300}
                  height={300}
                  style={{ objectFit: "contain" }}
                  src={`${props.game.settings.logo_url}?v=${Date.now()}`}
                  alt="Game logo"
                  priority // Load image immediately
                  unoptimized // Skip caching
                />
              </div>
            ) : (
              <TitleLogo insert={props.game.title_text} />
            )}
            <div className="flex flex-row justify-center">
              <h1 className="text-3xl text-foreground">
                {t("team")}: {props.team != null ? game.teams[props.team].name : t("pick your team")}
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                id="joinTeam1"
                className={`rounded-md bg-primary-200 p-5 hover:shadow-md ${
                  props.team === 0 ? "border-2 border-sky-600" : ""
                }`}
                onClick={() => {
                  props.setTeam(0);
                }}
              >
                {game.teams[0].name}
              </button>

              <button
                id="joinTeam2"
                className={`rounded-md bg-primary-200 p-5 hover:shadow-md ${
                  props.team === 1 ? "border-2 border-sky-600" : ""
                }`}
                onClick={() => {
                  props.setTeam(1);
                }}
              >
                {game.teams[1].name}
              </button>
            </div>
            <div className="flex flex-row justify-center">
              <button
                id="registerBuzzerButton"
                disabled={props.team === null}
                className={`rounded-md bg-success-200 px-16 py-8 font-bold uppercase hover:shadow-md ${
                  props.team === null ? "cursor-not-allowed opacity-50 hover:shadow-none" : ""
                }`}
                onClick={() => {
                  if (props.team != null) {
                    send({ action: "registerbuzz", team: props.team });
                  }
                }}
              >
                {t("play")}
              </button>
            </div>
            <div className="flex flex-row justify-center">
              <Link href="/game">
                <button
                  id="openGameWindowButton"
                  className="rounded-md bg-secondary-300 px-8 py-4 hover:shadow-md"
                  onClick={() => {
                    send({ action: "registerspectator", team: props.team });
                  }}
                >
                  {t("Open Game Window")}
                </button>
              </Link>
            </div>
          </>
        )}
      </>
    );
  }
  return (
    <div>
      <p id="loadingText" className="text-foreground">
        {t("loading")}
      </p>
    </div>
  );
}
