import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { Buffer } from "buffer";
import AdminSettings from "@/components/Admin/AdminSettings";
import CSVLoader from "@/components/Admin/CSVLoader";
import GameLoader from "@/components/Admin/GameLoader";
import HideGameQuestions from "@/components/Admin/HideGameQuestions";
import Players from "@/components/Admin/Players";
import BuzzerTable from "@/components/BuzzerTable";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ERROR_CODES } from "@/i18n/errorCodes";
import { debounce } from "@/lib/utils";
import { FileUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

function TitleMusic() {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex flex-row items-center space-x-5  p-5">
      <h3 className="text-2xl text-foreground">{t("Title Music")}</h3>
      <audio controls id="titleMusicAudio">
        <source src="title.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

function TeamControls(props) {
  const { i18n, t } = useTranslation();
  return (
    <>
      <button
        disabled={props.pointsGivin.state}
        id={`team${props.team}GivePointsButton`}
        className={`border-4 text-2xl ${props.pointsGivin.color} rounded p-10 ${props.pointsGivin.textColor}`}
        onClick={() => {
          props.game.teams[props.team].points =
            props.game.point_tracker[props.game.round] + props.game.teams[props.team].points;
          props.setPointsGivin({
            state: true,
            color: "bg-secondary-500",
            textColor: "text-foreground",
          });
          props.setGame((prv) => ({ ...prv }));
          props.send({ action: "data", data: props.game });
        }}
      >
        {t("team")} {t("number", { count: props.team + 1 })}: {props.game.teams[props.team].name} {t("Gets Points")}
      </button>
      <button
        id={`team${props.team}MistakeButton`}
        className="rounded border-4 bg-failure-500 p-10 text-2xl text-foreground"
        onClick={() => {
          if (props.game.teams[props.team].mistakes < 3) props.game.teams[props.team].mistakes++;
          props.setGame((prv) => ({ ...prv }));
          props.send({ action: "data", data: props.game });
          props.send({
            action: "mistake",
            data: props.game.teams[props.team].mistake,
          });
        }}
      >
        {t("team")} {t("number", { count: props.team + 1 })}: {props.game.teams[props.team].name} {t("mistake")}
      </button>
    </>
  );
}

function FinalRoundButtonControls(props) {
  const { i18n, t } = useTranslation();
  const controlRound = props.game.is_final_second ? props.game.final_round_2 : props.game.final_round;
  return controlRound?.map((x, i) => (
    <div
      key={`${props.game.is_final_second ? "final-round-2" : "final-round-1"}-question-${i}`}
      className="flex flex-col space-y-5 border-2 p-12"
    >
      <p className="text-3xl font-bold text-foreground">{x.question}</p>
      {props.game.is_final_second && (
        <div className="flex flex-row space-x-5 pb-2">
          {/* PARTNER'S ANSWER PROVIDED FINAL ROUND */}
          <div className="w-48 grow p-5 align-middle text-3xl text-foreground">
            <i>{t("Partner's Answer")}</i>: {props.game.final_round[i].input || `(${t("No Answer")})`}
          </div>
          {props.game.final_round[i].input && (
            <button
              id={`alreadyAnswered${i}Button`}
              className="grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
              onClick={() => props.send({ action: "duplicate" })}
            >
              {t("Already Answered")}
            </button>
          )}
        </div>
      )}
      <div className="flex flex-row space-x-5 pb-2">
        {/* ANSWER PROVIDED FINAL ROUND */}
        <input
          id={`finalRoundAnswer${i}Input`}
          className="w-48 grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground placeholder:text-secondary-900"
          placeholder={t("Answer")}
          value={x.input}
          onChange={(e) => {
            x.input = e.target.value;
            props.setGame((prv) => ({ ...prv }));
          }}
        />

        <button
          id={`finalRoundAnswer${i}RevealButton`}
          className="grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
          onClick={() => {
            x.revealed = true;
            props.setGame((prv) => ({ ...prv }));
            props.send({ action: "data", data: props.game });
            props.send({ action: "final_reveal" });
          }}
        >
          {t("Reveal Answer")}
        </button>
      </div>
      <div className="flex flex-row space-x-5">
        {/* POINTS AWARDED FINAL ROUND */}
        <select
          id={`finalRoundAnswer${i}Selector`}
          value={x.selection}
          className="w-48 grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
          onChange={(e) => {
            x.selection = parseInt(e.target.value);
            props.setGame((prv) => ({ ...prv }));
            props.send({ action: "data", data: props.game });
          }}
        >
          <option value={0}>({t("No Answer")}) 0</option>
          {x.answers.map((key, index) => (
            <option key={`answers-${key}`} value={index + 1}>
              {x.answers[index][0]} {x.answers[index][1]}
            </option>
          ))}
        </select>

        <button
          className="grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
          id={`finalRoundAnswers${i}SubmitButton`}
          onClick={() => {
            x.points = x.selection !== 0 ? x.answers[x.selection - 1][1] : 0;
            props.setGame((prv) => ({ ...prv }));
            props.send({ action: "data", data: props.game });
            props.send({
              action: x.selection !== 0 ? "final_submit" : "mistake",
            });
          }}
        >
          {t("Award points")}
        </button>
      </div>
    </div>
  ));
}

function TitleLogoUpload(props) {
  const { i18n, t } = useTranslation();
  if (props.imageUploaded !== null) {
    return (
      <div className="flex flex-row items-center space-x-2">
        <p className="capitalize text-foreground">logo:</p>
        <Image
          width={150}
          height={150}
          style={{ objectFit: "contain" }}
          src={URL.createObjectURL(props.imageUploaded)}
          alt="Game Logo"
        />
        <button
          className="rounded-lg border-2 bg-secondary-500 p-1 hover:bg-secondary-700"
          id="deleteLogoButton"
          onClick={(e) => {
            props.send({
              action: "del_logo_upload",
              room: props.room,
            });
            URL.revokeObjectURL(props.imageUploaded);
            props.setImageUploaded(null);
            props.game.settings.logo_url = null;
            props.setGame((prv) => ({ ...prv }));
            props.send({ action: "data", data: props.game });
          }}
        >
          {/* cancel.svg */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 717 718"
          >
            <path
              d="M651.22 154c98 139 85 334-40 459s-318 137-458 40c-16-12-34-26-49-40c-15-15-28-32-39-49c-98-139-86-334 39-459s319-137 459-40c16 12 33 26 48 40c15 15 29 32 40 49zm-522 345l370-370c-104-63-242-50-331 39c-90 90-102 228-39 331zm458-280l-370 369c104 63 242 50 331-39c90-90 102-227 39-330z"
              fill="#ffffff"
            />
            <rect x="0" y="0" width="717" height="718" fill="rgba(0, 0, 0, 0)" />
          </svg>
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex flex-row items-center space-x-2">
        <div className="image-upload">
          <label htmlFor="logoUpload">
            <FileUp className="cursor-pointer text-secondary-900 hover:text-secondary-500" size={38} />
          </label>
          <input
            className="hidden"
            type="file"
            accept="image/png, image/jpeg, image/gif"
            id="logoUpload"
            onChange={(e) => {
              var file = document.getElementById("logoUpload").files[0];

              if (file) {
                if (file.size > process.env.NEXT_PUBLIC_MAX_IMAGE_UPLOAD_SIZE_MB * 1024 * 1024) {
                  console.error("Logo image is too large");
                  toast.error(t(ERROR_CODES.IMAGE_TOO_LARGE, { message: "2MB" }));
                  return;
                }
                var reader = new FileReader();
                let rawData = new ArrayBuffer();
                reader.onload = function (evt) {
                  rawData = evt.target.result;
                  var headerarr = new Uint8Array(evt.target.result).subarray(0, 4);
                  var header = "";
                  for (var i = 0; i < headerarr.length; i++) {
                    header += headerarr[i].toString(16);
                  }
                  let mimetype = "";
                  switch (header) {
                    case "89504e47":
                      mimetype = "png";
                      break;
                    case "47494638":
                      mimetype = "gif";
                      break;
                    case "ffd8ffe0":
                    case "ffd8ffe1":
                    case "ffd8ffe2":
                    case "ffd8ffe3":
                    case "ffd8ffe8":
                      mimetype = "jpeg";
                      break;
                    default:
                      toast.error(t(ERROR_CODES.UNKNOWN_FILE_TYPE));
                      return;
                  }

                  const bufferData = Buffer.from(rawData).toString("base64");
                  props.send({
                    action: "logo_upload",
                    logoData: bufferData,
                    mimetype: mimetype,
                  });
                  props.setImageUploaded(file);
                  props.game.settings.logo_url = `/api/rooms/${props.room}/logo`;
                  props.setGame((prv) => ({ ...prv }));
                  props.send({ action: "data", data: props.game });
                };
                reader.readAsArrayBuffer(file);
              }
              document.getElementById("logoUpload").value = null;
            }}
          />
        </div>
        <div>
          <p className="text-s text-secondary-900">{t("logo upload")}</p>
          <p className="text-xs text-secondary-900">{t("(must be smaller than 2MB)")}</p>
        </div>
      </div>
    );
  }
}

function FinalRoundPointTotalsTextFunction(props) {
  const { i18n, t } = useTranslation();
  let backgroundColor = "bg-secondary-300";
  if (props.isFinalSecond && props.place === 1) {
    backgroundColor = "bg-primary-200";
  } else if (!props.isFinalSecond && props.place === 0) {
    backgroundColor = "bg-primary-200";
  }
  return (
    <div
      className={`flex flex-row items-center space-x-2 rounded-3xl border-2 p-4 text-2xl text-foreground ${backgroundColor} text-foreground`}
    >
      <p id={`finalRoundPointTotal${props.place}TitleText`} className="">
        {t(props.title)}:{" "}
      </p>
      <p id={`finalRoundPointTotal${props.place}TotalText`} className="">
        {props.total}
      </p>
    </div>
  );
}

function FinalRoundPointTotals(props) {
  let roundOneTotal = 0;
  let roundTwoTotal = 0;
  let total = 0;
  props.game.final_round.forEach((round) => {
    console.debug("round one total: ");
    roundOneTotal = roundOneTotal + parseInt(round.points);
  });
  props.game.final_round_2.forEach((round) => {
    console.debug("round two total", total);
    roundTwoTotal = roundTwoTotal + parseInt(round.points);
  });
  total = roundOneTotal + roundTwoTotal;
  return (
    <div className="flex flex-row items-center justify-start space-x-5 py-3">
      <FinalRoundPointTotalsTextFunction
        title="Round one"
        total={roundOneTotal}
        isFinalSecond={props.game.is_final_second}
        place={0}
      />
      <FinalRoundPointTotalsTextFunction
        title="Round two"
        total={roundTwoTotal}
        isFinalSecond={props.game.is_final_second}
        place={1}
      />
      <FinalRoundPointTotalsTextFunction
        title="Total"
        total={total}
        isFinalSecond={props.game.is_final_second}
        place={2}
      />
    </div>
  );
}

export default function AdminPage(props) {
  const { i18n, t } = useTranslation();

  const [pointsGivin, setPointsGivin] = useState({
    state: false,
    color: "bg-success-500",
    textColor: "text-foreground",
  });
  const [gameSelector, setGameSelector] = useState([]);
  const [imageUploaded, setImageUploaded] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [csvFileUpload, setCsvFileUpload] = useState(null);
  const [csvFileUploadText, setCsvFileUploadText] = useState(null);
  let ws = props.ws;
  let game = props.game;
  let refreshCounter = 0;

  function send(data) {
    data.room = props.room;
    data.id = props.id;
    console.debug(data);
    ws.current.send(JSON.stringify(data));
  }

  useEffect(() => {
    const retryInterval = setInterval(() => {
      if (ws.current.readyState !== 1) {
        toast.error(t(ERROR_CODES.CONNECTION_LOST, { message: `${5 - refreshCounter}` }));
        refreshCounter++;
        if (refreshCounter >= 10) {
          console.debug("admin reload()");
          location.reload();
        }
      }
    }, 1000);

    const handleMessage = (evt) => {
      var received_msg = evt.data;
      let json = JSON.parse(received_msg);
      if (json.action === "data") {
        props.setGame(json.data);
      } else if (json.action === "change_lang") {
        console.debug("Language Change", json.data);
        if (json.games != null) {
          setGameSelector(json.games);
        } else {
          setGameSelector([]);
        }
      } else if (json.action === "error") {
        console.error(json.code);
        toast.error(t(json.code, { message: json.message }));
      } else if (json.action === "timer_complete") {
        setTimerStarted(false);
        setTimerCompleted(true);
      } else {
        console.debug("did not expect admin: ", json);
      }
    };

    ws.current.addEventListener("message", handleMessage);
    send({ action: "change_lang", data: i18n.language?.split("-")[0] });
    return () => {
      clearInterval(retryInterval);
      ws.current.removeEventListener("message", handleMessage);
    };
  }, [i18n.language]);

  if (game.teams != null) {
    let current_screen;
    if (game.title) {
      current_screen = t("title");
    } else if (game.is_final_round && !game.is_final_second) {
      current_screen = `${t("Final Round")} ${t("number", { count: 1 })}`;
    } else if (game.is_final_round && game.is_final_second) {
      current_screen = `${t("Final Round")} ${t("number", { count: 2 })}`;
    } else {
      current_screen = `${t("round")} ${t("number", {
        count: game.round + 1,
      })}`;
    }

    if (game.rounds != null) {
      // var put it into function scope
      var current_round = game.rounds[game.round];
      console.debug("This is current round", current_round);
    }
    return (
      <div
        className="lg:min-w-0"
        style={{
          minWidth: "100vh",
        }}
      >
        <div className="min-h-full">
          {/* ROOM CODE TEXT */}
          <p id="roomCodeText" className="p-4 text-center text-8xl font-semibold uppercase text-foreground">
            {props.room}
          </p>
          <hr />
          <div className="flex flex-row justify-evenly p-5 ">
            {/* ADMIN BUTTONS */}
            <Link href="/game" target="_blank" id="openGameWindowButton">
              <button className="text-2xl">
                <div className="flex w-48 justify-center rounded bg-success-200 p-2 hover:shadow-md">
                  {t("Open Game Window")}
                </div>
              </button>
            </Link>
            <Link href="/new" id="createNewGameButton">
              <button className="text-2xl">
                <div className="flex w-48 justify-center rounded bg-primary-200 p-2 hover:shadow-md">
                  {t("Create New Game")}
                </div>
              </button>
            </Link>
            <button
              id="quitButton"
              className="text-2xl"
              onClick={() => {
                props.quitGame(true);
              }}
            >
              <div className="flex w-32 justify-center rounded bg-failure-200 p-2 hover:shadow-md">{t("Quit")}</div>
            </button>
          </div>
          <div className="m-5 flex flex-row items-center justify-evenly">
            <LanguageSwitcher
              onChange={(e) => {
                i18n.changeLanguage(e.target.value);
                send({ action: "change_lang", data: e.target.value });
              }}
            />
            <GameLoader
              gameSelector={gameSelector}
              send={send}
              setCsvFileUpload={setCsvFileUpload}
              setCsvFileUploadText={setCsvFileUploadText}
            />
          </div>
        </div>

        <hr className="my-12" />
        <div className="flex flex-col items-center space-y-5">
          <div className="grid grid-cols-2 gap-x-48 gap-y-10">
            <div className="flex flex-row justify-between space-x-5">
              {/* TITLE TEXT INPUT */}
              <div className="flex flex-row items-center space-x-5">
                <p className="text-2xl text-foreground">{t("Title Text")}:</p>
                <input
                  id="titleTextInput"
                  className="w-44 rounded border-4 bg-secondary-500 p-1 text-2xl text-foreground placeholder:text-secondary-900"
                  onChange={debounce((e) => {
                    game.title_text = e.target.value;
                    props.setGame((prv) => ({ ...prv }));
                    send({ action: "data", data: game });
                  })}
                  placeholder={t("My Family")}
                  defaultValue={game.title_text}
                ></input>
              </div>
            </div>
            <TitleLogoUpload
              send={send}
              room={props.room}
              setGame={props.setGame}
              game={game}
              setImageUploaded={setImageUploaded}
              imageUploaded={imageUploaded}
            />
            <div className="w-80 flex-row items-center space-x-1">
              {/* TEAM 1 NAME CHANGER */}
              <input
                id="teamOneNameInput"
                className="w-52 rounded border-4 bg-secondary-500 p-1 text-3xl text-foreground placeholder:text-secondary-900"
                onChange={debounce((e) => {
                  game.teams[0].name = e.target.value;
                  props.setGame((prv) => ({ ...prv }));
                  send({ action: "data", data: game });
                })}
                placeholder={t("Team Name")}
                defaultValue={game.teams[0].name}
              ></input>
              {/* TEAM 1 POINTS CHANGER */}
              <input
                id="teamOnePointsInput"
                type="number"
                min="0"
                required
                className="w-20 rounded border-4 bg-secondary-500 p-1 text-center text-3xl text-foreground placeholder:text-secondary-900"
                onChange={(e) => {
                  let number = parseInt(e.target.value);
                  console.debug(number);
                  isNaN(number) ? (number = 0) : null;
                  game.teams[0].points = number;
                  props.setGame((prv) => ({ ...prv }));
                  send({ action: "data", data: game });
                }}
                value={game.teams[0].points}
              ></input>
            </div>
            <div className="w-80 flex-row items-center space-x-1">
              {/* TEAM 2 NAME CHANGER */}
              <input
                id="teamTwoNameInput"
                className="w-52 rounded border-4 bg-secondary-500 p-1 text-3xl text-foreground placeholder:text-secondary-900"
                onChange={debounce((e) => {
                  game.teams[1].name = e.target.value;
                  props.setGame((prv) => ({ ...prv }));
                  send({ action: "data", data: game });
                })}
                placeholder={t("Team Name")}
                defaultValue={game.teams[1].name}
              ></input>
              {/* TEAM 2 POINTS CHANGER */}
              <input
                id="teamTwoPointsInput"
                type="number"
                min="0"
                required
                className="w-20 rounded border-4 bg-secondary-500 p-1 text-center text-3xl text-foreground placeholder:text-secondary-900"
                onChange={(e) => {
                  let number = parseInt(e.target.value);
                  isNaN(number) ? (number = 0) : null;
                  game.teams[1].points = number;
                  props.setGame((prv) => ({ ...prv }));
                  send({ action: "data", data: game });
                }}
                value={game.teams[1].points}
              ></input>
            </div>
          </div>
        </div>
        <hr className="my-12" />
        {/* ADMIN CONTROLS */}
        <AdminSettings game={game} setGame={props.setGame} send={send} />
        {/* SHOW ERRORS TO ADMIN */}
        {game.rounds == null ? (
          <p className="py-20 text-center text-2xl text-secondary-900">[{t("Please load a game")}]</p>
        ) : (
          <div>
            <div className="flex-col space-y-5 p-5">
              <hr />
              <div className="flex flex-row items-baseline justify-evenly">
                <TitleMusic />
                {/* CURRENT SCREEN TEXT */}
                <p id="currentScreenText" className="pt-5 text-center text-2xl text-foreground">
                  {" "}
                  {t("Current Screen")}: {current_screen}
                </p>
              </div>

              <div className="flex grow flex-row space-x-10">
                {/* TITLE SCREEN BUTTON */}
                <button
                  id="titleCardButton"
                  className="grow rounded border-4 bg-secondary-300 p-10 text-2xl text-foreground"
                  onClick={() => {
                    game.title = true;
                    game.round = 0;
                    game.is_final_round = false;
                    game.is_final_second = false;
                    props.setGame((prv) => ({ ...prv }));
                    send({ action: "data", data: game });
                  }}
                >
                  {t("Title Card")}
                </button>

                <HideGameQuestions game={game} setGame={props.setGame} send={send} />

                {/* FINAL ROUND BUTTON */}
                {game.final_round ? (
                  <button
                    id="finalRoundButton"
                    className="grow rounded border-4 bg-secondary-300 p-10 text-2xl text-foreground"
                    onClick={() => {
                      game.title = false;
                      game.is_final_round = true;
                      game.is_final_second = false;
                      props.setGame((prv) => ({ ...prv }));
                      send({ action: "data", data: game });
                      send({
                        action: "set_timer",
                        data: game.final_round_timers[0],
                      });
                    }}
                  >
                    {t("Final Round")}
                  </button>
                ) : null}

                {/* ROUND SELECTOR */}
                <select
                  className="grow rounded border-4 bg-secondary-300 p-10 text-2xl text-foreground"
                  id="roundSelector"
                  value={game.round}
                  onChange={(e) => {
                    game.round = parseInt(e.target.value);
                    game.is_final_round = false;
                    game.is_final_second = false;
                    game.teams[0].mistakes = 0;
                    game.teams[1].mistakes = 0;
                    game.title = false;
                    game.settings.hide_questions = true;
                    props.setGame((prv) => ({ ...prv }));
                    setPointsGivin({
                      state: false,
                      color: "bg-success-500",
                      textColor: "text-foreground",
                    });
                    send({ action: "data", data: game });
                  }}
                >
                  {game.rounds.map((key, index) => (
                    <option value={index} key={`round-select-${index}`}>
                      {t("round")} {t("number", { count: index + 1 })}
                    </option>
                  ))}
                </select>
              </div>
              {/* START ROUND 1 BUTTON */}
              <div className="flex flex-row space-x-10">
                <button
                  id="startRoundOneButton"
                  className="grow rounded border-4 bg-secondary-300 p-10 text-2xl text-foreground"
                  onClick={() => {
                    game.title = false;
                    game.is_final_round = false;
                    game.is_final_second = false;
                    game.round = 0;
                    game.settings.hide_questions = true;
                    props.setGame((prv) => ({
                      ...prv,
                    }));
                    setPointsGivin({
                      state: false,
                      color: "bg-success-500",
                      textColor: "text-foreground",
                    });
                    send({ action: "data", data: game });
                  }}
                >
                  {t("Start Round 1")}
                </button>

                {/* NEXT ROUND BUTTON */}
                <button
                  className="grow rounded border-4 bg-secondary-300 p-10 text-2xl text-foreground"
                  id="nextRoundButton"
                  onClick={() => {
                    game.title = false;
                    game.is_final_round = false;
                    game.is_final_second = false;
                    game.teams[0].mistakes = 0;
                    game.teams[1].mistakes = 0;
                    if (game.round < game.rounds.length - 1) {
                      game.round = game.round + 1;
                    }
                    game.settings.hide_questions = true;
                    props.setGame((prv) => ({ ...prv }));
                    setPointsGivin({
                      state: false,
                      color: "bg-success-500",
                      textColor: "text-foreground",
                    });
                    console.debug(game.round);
                    send({ action: "data", data: game });
                  }}
                >
                  {t("Next Round")}
                </button>
                <button
                  id="showMistakeButton"
                  className="flex grow flex-row items-center justify-center rounded border-4 bg-secondary-300 p-10 text-2xl text-foreground"
                  onClick={() => {
                    send({ action: "show_mistake" });
                  }}
                >
                  <Image width={150} height={150} style={{ objectFit: "contain" }} src="/x.png" alt="Show Mistake" />
                </button>
                <button
                  id="resetMistakesButton"
                  className="grow rounded border-4 bg-secondary-300 p-10 text-2xl text-foreground"
                  onClick={() => {
                    for (let team in props.game.teams) {
                      props.game.teams[team].mistakes = 0;
                    }
                    props.setGame((prv) => ({ ...prv }));
                    send({ action: "data", data: props.game });
                  }}
                >
                  {t("Reset Mistakes")}
                </button>
              </div>

              {/* GETS POINTS MISTAKE */}
              <div className="grid grid-flow-col grid-rows-2 gap-5">
                <TeamControls
                  game={game}
                  setGame={props.setGame}
                  team={0}
                  send={send}
                  setPointsGivin={setPointsGivin}
                  pointsGivin={pointsGivin}
                />
                <TeamControls
                  game={game}
                  setGame={props.setGame}
                  send={send}
                  team={1}
                  setPointsGivin={setPointsGivin}
                  pointsGivin={pointsGivin}
                />
              </div>
            </div>
            <hr />

            {/* IS NOT THE FINAL ROUND */}
            {!game.is_final_round ? (
              // GAME BOARD CONTROLS
              <div>
                <div className="flex flex-col space-y-2 px-10 pt-5">
                  {/* QUESTION */}
                  <p id="currentRoundQuestionText" className="text-3xl font-bold text-foreground">
                    {current_round.question}
                  </p>
                  {/* POINT TRACKER */}
                  <div className="flex flex-row items-center justify-between space-x-5 border-4 p-2">
                    <div className="flex flex-row items-center space-x-5">
                      <h3 id="pointsText" className="text-xl  text-foreground">
                        {t("Points")}:{" "}
                      </h3>
                      <h3 id="pointsNumberText" className="grow text-2xl  text-foreground">
                        {t("number", { count: game.point_tracker[game.round] })}
                      </h3>
                    </div>
                    <div className="flex flex-row items-center space-x-2">
                      <h3 id="multiplierText" className="text-xl text-foreground">
                        {t("multiplier")}:{" "}
                      </h3>
                      <h3 className="text-2xl text-foreground">x</h3>
                      <input
                        type="number"
                        id="multiplierInput"
                        min="1"
                        className="w-24 border-2 bg-secondary-200 p-1 text-foreground placeholder:text-secondary-900"
                        value={current_round.multiply}
                        placeholder={t("multiplier")}
                        onChange={(e) => {
                          let value = parseInt(e.target.value);
                          if (value === 0) {
                            value = 1;
                          }
                          current_round.multiply = value;
                          props.setGame((prv) => ({ ...prv }));
                          send({ action: "data", data: game });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* GAME BOARD BUTTONS */}
                <div className=" mx-10 mt-5 grid grid-flow-col grid-rows-4 gap-3  rounded border-4 p-3 text-white ">
                  {current_round.answers.map((x, index) => (
                    <div
                      key={`answer-${index}`}
                      className={`${
                        x.trig ? "bg-secondary-500" : "bg-primary-700"
                      } rounded border-2 text-2xl font-extrabold uppercase`}
                    >
                      <button
                        className="flex min-h-full min-w-full flex-row items-center justify-center p-5"
                        id={`question${index}Button`}
                        onClick={() => {
                          x.trig = !x.trig;
                          props.setGame((prv) => ({ ...prv }));

                          if (x.trig) {
                            game.point_tracker[game.round] =
                              game.point_tracker[game.round] + x.pnt * current_round.multiply;
                            props.setGame((prv) => ({ ...prv }));
                            send({ action: "reveal" });
                          } else {
                            game.point_tracker[game.round] =
                              game.point_tracker[game.round] - x.pnt * current_round.multiply;
                            if (game.point_tracker[game.round] < 0) {
                              game.point_tracker[game.round] = 0;
                            }
                            props.setGame((prv) => ({ ...prv }));
                          }
                          send({ action: "data", data: game });
                        }}
                      >
                        <div className="grow">{x.ans}</div>
                        <div id={`answer${index}PointsText`} className="p-2">
                          {t("number", { count: x.pnt })}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>

                {/* BUZZERS AND PLAYERS */}
                <div className="grid grid-cols-2 gap-4 p-5">
                  <h1 className="text-2xl capitalize text-foreground">{t("Buzzer Order")}</h1>
                  <h1 className="text-2xl capitalize text-foreground">{t("players")}</h1>
                  <div className="h-48 overflow-y-scroll rounded border-4 p-5 text-center">
                    <div className="flex h-full  flex-col justify-between space-y-2">
                      <div className="">
                        {game.buzzed.length > 0 ? (
                          <div className="flex flex-row items-center space-x-5">
                            {/* active clear buzzers button */}
                            <button
                              id="clearBuzzersButton"
                              className="rounded border-4 bg-failure-200 p-2 text-foreground hover:bg-failure-500"
                              onClick={() => {
                                send({ action: "clearbuzzers" });
                              }}
                            >
                              {t("Clear Buzzers")}
                            </button>
                            <p className="text-secondary-900">{t("Changing rounds also clears buzzers")}</p>
                          </div>
                        ) : (
                          <div className="flex flex-row items-center space-x-5">
                            {/* disabled clear buzzers button */}
                            <button
                              id="clearBuzzersButtonDisabled"
                              className="rounded border-4 bg-secondary-500 p-2 text-foreground"
                            >
                              {t("Clear Buzzers")}
                            </button>
                            <p className="text-secondary-900">{t("Changing rounds also clears buzzers")}</p>
                          </div>
                        )}
                      </div>
                      <hr />
                      <div className="grow">
                        <BuzzerTable game={game} />
                      </div>
                    </div>
                  </div>
                  <Players game={game} setGame={props.setGame} ws={ws} room={props.room} />
                </div>
              </div>
            ) : (
              // FINAL ROUND
              <div>
                <Players game={game} setGame={props.setGame} ws={ws} room={props.room} />
                <div className="p-5">
                  {/* FINAL ROUND TEXT */}
                  <h2 id="finalRoundNumberText" className="py-5 text-center text-6xl text-foreground">
                    {t("Final Round")} {t("number", { count: game.is_final_second ? "2" : "1" })}
                  </h2>
                  <hr />
                  <div className="flex flex-row items-center justify-evenly space-x-5 py-5">
                    {/* START FINAL ROUND 2 */}
                    {!game.is_final_second ? (
                      <button
                        id="startFinalRound2Button"
                        className={`rounded border-4 bg-secondary-300 p-5 text-3xl text-foreground ${timerStarted ? "opacity-50" : ""}`}
                        disabled={timerStarted}
                        onClick={() => {
                          console.debug(game);
                          game.is_final_second = true;
                          game.hide_first_round = true;
                          props.setGame((prv) => ({ ...prv }));
                          send({ action: "data", data: game });
                          send({
                            action: "set_timer",
                            data: game.final_round_timers[1],
                          });
                          setTimerCompleted(false);
                        }}
                      >
                        {t("start")} {t("Final Round")} {t("number", { count: 2 })}
                      </button>
                    ) : (
                      <div className="flex flex-row items-center justify-evenly space-x-5 py-5 text-foreground">
                        {/* GO BACK TO FINAL ROUND 1 */}
                        <button
                          id="backToRound1FinalButton"
                          className={`rounded border-4 bg-secondary-300 p-5 text-3xl ${timerStarted ? "opacity-50" : ""}`}
                          disabled={timerStarted}
                          onClick={() => {
                            game.is_final_round = true;
                            game.hide_first_round = false;
                            game.is_final_second = false;
                            props.setGame((prv) => ({ ...prv }));
                            send({ action: "data", data: game });
                            send({
                              action: "set_timer",
                              data: game.final_round_timers[0],
                            });
                          }}
                        >
                          {t("Back To")} {t("Final Round")} {t("number", { count: 1 })}
                        </button>
                        {game.is_final_second ? (
                          <div>
                            {/* REVEAL FIRST ROUND ANSWERS */}
                            {game.hide_first_round ? (
                              <button
                                id="revealFirstRoundFinalButton"
                                className="rounded border-4 bg-secondary-300 p-5 text-3xl text-foreground"
                                onClick={() => {
                                  game.hide_first_round = false;
                                  props.setGame((prv) => ({ ...prv }));
                                  send({ action: "data", data: game });
                                }}
                              >
                                {t("Reveal First Round Answers")}
                              </button>
                            ) : (
                              // HIDE FIRST ROUND ANSWERS
                              <button
                                id="hideFirstRoundAnswersButton"
                                className="rounded border-4 bg-secondary-300 p-5 text-3xl text-foreground"
                                onClick={() => {
                                  game.hide_first_round = true;
                                  props.setGame((prv) => ({ ...prv }));
                                  send({ action: "data", data: game });
                                }}
                              >
                                {t("Hide First Round Answers")}
                              </button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                    <div className="flex px-2">
                      {!timerStarted ? (
                        /* START TIMER */
                        <button
                          id="startTimerButton"
                          className={`rounded border-4 bg-secondary-300 p-5 text-3xl text-foreground ${timerCompleted ? "opacity-50" : ""}`}
                          disabled={timerCompleted}
                          onClick={() => {
                            if (game.is_final_second) {
                              send({
                                action: "start_timer",
                                data: game.final_round_timers[1],
                              });
                            } else {
                              send({
                                action: "start_timer",
                                data: game.final_round_timers[0],
                              });
                            }
                            setTimerStarted(true);
                            setTimerCompleted(false);
                          }}
                        >
                          {t("Start Timer")}
                        </button>
                      ) : (
                        /* STOP TIMER */
                        <button
                          id="stopTimerButton"
                          className="rounded border-4 bg-secondary-300 p-5 text-3xl text-foreground"
                          onClick={() => {
                            send({ action: "stop_timer" });
                            setTimerStarted(false);
                          }}
                        >
                          {t("Stop Timer")}
                        </button>
                      )}
                      <button
                        className={`ml-2 rounded border-4 bg-secondary-300 p-5 text-3xl text-foreground ${!timerStarted ? "" : "opacity-50"}`}
                        disabled={timerStarted}
                        id="resetTimerButton"
                        onClick={() => {
                          if (!timerStarted) {
                            if (game.is_final_second) {
                              send({
                                action: "set_timer",
                                data: game.final_round_timers[1],
                              });
                            } else {
                              send({
                                action: "set_timer",
                                data: game.final_round_timers[0],
                              });
                            }
                          }
                          setTimerCompleted(false);
                        }}
                      >
                        {t("Reset Timer")}
                      </button>
                    </div>
                  </div>
                  <FinalRoundPointTotals game={game} />
                  {/* FINAL ROUND QUESTIONS AND ANSWERS */}
                  <FinalRoundButtonControls game={game} setGame={props.setGame} send={send} />
                </div>
              </div>
            )}
          </div>
        )}
        {/* Modal over whole admin page */}
        {csvFileUpload ? (
          <CSVLoader
            csvFileUpload={csvFileUpload}
            setCsvFileUpload={setCsvFileUpload}
            csvFileUploadText={csvFileUploadText}
            send={send}
          />
        ) : null}
      </div>
    );
  } else {
    return (
      <div>
        <p>{t("loading")}</p>
      </div>
    );
  }
}
