import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import AdminSettings from "@/components/Admin/AdminSettings";
import CSVLoader from "@/components/Admin/CSVLoader";
import GameDisplay from "@/components/Admin/GameDisplay";
import RoomSettings from "@/components/Admin/RoomSettings";
import TitlesAndLogoSettings from "@/components/Admin/TitlesAndLogoSettings";
import { ERROR_CODES } from "@/i18n/errorCodes";
import { Game } from "@/types/game";
import { toast } from "sonner";

interface AdminPageProps {
  ws: React.RefObject<WebSocket>;
  game: Game;
  setGame: React.Dispatch<React.SetStateAction<Game | null>>;
  room: string;
  quitGame: () => void;
  playerId: string | null;
}

export default function AdminPage({ ws, game, setGame, room, quitGame, playerId }: AdminPageProps) {
  const { i18n, t } = useTranslation();

  const [pointsGiven, setPointsGiven] = useState({
    state: false,
    color: "bg-success-500",
    textColor: "text-foreground",
  });
  const [gameSelector, setGameSelector] = useState([]);
  const [imageUploaded, setImageUploaded] = useState<File | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [csvFileUpload, setCsvFileUpload] = useState<File | null>(null);
  const [csvFileUploadText, setCsvFileUploadText] = useState("");
  let refreshCounter = 0;

  function send(data: any) {
    console.debug("Sending", data);
    ws.current.send(JSON.stringify({ ...data, room, id: playerId }));
  }

  const handleMessage = (evt: MessageEvent) => {
    var received_msg = evt.data;
    let json = JSON.parse(received_msg);
    if (json.action === "data") {
      setGame(json.data);
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

    ws.current.addEventListener("message", handleMessage);
    send({ action: "change_lang", data: i18n.language?.split("-")[0] });
    return () => {
      clearInterval(retryInterval);
      ws.current.removeEventListener("message", handleMessage);
    };
  }, [i18n.language]);

  if (game.teams == null) {
    return (
      <div>
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div
      className="lg:min-w-0"
      style={{
        minWidth: "100vh",
      }}
    >
      <RoomSettings
        room={room}
        gameSelector={gameSelector}
        send={send}
        setCsvFileUpload={setCsvFileUpload}
        setCsvFileUploadText={setCsvFileUploadText}
        quitGame={quitGame}
      />
      <hr className="my-12" />
      <TitlesAndLogoSettings
        game={game}
        send={send}
        room={room}
        setGame={setGame}
        setImageUploaded={setImageUploaded}
        imageUploaded={imageUploaded}
      />
      <hr className="my-12" />
      {/* ADMIN CONTROLS */}
      <AdminSettings game={game} setGame={setGame} send={send} />
      <GameDisplay
        ws={ws}
        setGame={setGame}
        game={game}
        room={room}
        send={send}
        setPointsGiven={setPointsGiven}
        pointsGiven={pointsGiven}
        timerStarted={timerStarted}
        timerCompleted={timerCompleted}
        setTimerStarted={setTimerStarted}
        setTimerCompleted={setTimerCompleted}
      />
      {/* Modal over whole admin page */}
      {csvFileUpload && (
        <CSVLoader
          csvFileUpload={csvFileUpload}
          setCsvFileUpload={setCsvFileUpload}
          csvFileUploadText={csvFileUploadText}
          send={send}
        />
      )}
    </div>
  );
}
