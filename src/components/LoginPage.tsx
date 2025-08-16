import LanguageSwitcher from "@/components/LanguageSwitcher";
import TitleLogo from "@/components/TitleLogo";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import ThemeSwitcher from "@/components/Admin/ThemeSwitcher";
import HelpButton from "@/components/HelpButton";
import { ERROR_CODES } from "@/i18n/errorCodes";
import { toast } from "sonner";
import { GameTheme } from "../types";

interface LoginPageProps {
  hostRoom: () => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  joinRoom: () => void;
}

export default function LoginPage({
  hostRoom,
  roomCode,
  setRoomCode,
  playerName,
  setPlayerName,
  joinRoom,
}: LoginPageProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [game, setGame] = useState<GameTheme>({ settings: { theme: theme || "default" } });

  const isValidRoomCode = (code: string) => code.length === 4;
  const isValidPlayerName = (name: string) => name.length > 0 && name.length <= 12;

  const handlePlay = () => {
    if (!isValidPlayerName(playerName)) {
      toast.error(t(ERROR_CODES.MISSING_INPUT, { message: t("name") }));
      return;
    }

    if (!isValidRoomCode(roomCode)) {
      toast.error(t("room code is not correct length, should be 4 characters"));
      return;
    }

    joinRoom();
  };

  return (
    <div className={`flex min-h-screen w-full flex-col space-y-10 bg-background p-5`}>
      <div className="flex w-full flex-col items-center justify-between gap-2 sm:flex-row">
        <LanguageSwitcher />
        <ThemeSwitcher game={game} setGame={setGame} send={() => {}} />
        <HelpButton doc="/help" textSize="text-lg" padding=" px-5 py-2 " />
      </div>
      <TitleLogo insert="" />
      <div className="flex flex-col">
        <div className="text-1xl flex flex-row justify-between px-2">
          <p className="uppercase text-foreground">{t("room code")}</p>
        </div>
        <input
          className="border-secondary-600 rounded-2xl border-4 bg-secondary-300 p-2 text-2xl uppercase text-foreground"
          id="roomCodeInput"
          onChange={(e) => setRoomCode(e.target.value)}
          maxLength={4}
          value={roomCode}
          placeholder={t("4 letter room code")}
        ></input>
      </div>

      <div className="flex flex-col">
        <div className="text-1xl flex flex-row justify-between px-2">
          <p className="text-foreground">{t("name")}</p>
          <p className="text-foreground">{12 - playerName.length}</p>
        </div>
        <input
          className="border-secondary-600 rounded-2xl border-4 bg-secondary-300 p-2 text-2xl uppercase text-foreground"
          id="playerNameInput"
          maxLength={12}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder={t("enter your name")}
        ></input>
      </div>
      <div className="flex flex-row items-center space-x-5">
        <button
          id="joinRoomButton"
          className="w-2/3 grow rounded-md bg-success-300 p-4 text-2xl uppercase text-foreground shadow-md"
          onClick={handlePlay}
        >
          <div className="grow">{t("play")}</div>
        </button>
        <button
          id="hostRoomButton"
          className="rounded-md bg-secondary-300 p-4 text-2xl uppercase text-foreground shadow-md"
          onClick={() => {
            hostRoom();
          }}
        >
          {t("host")}
        </button>
      </div>
    </div>
  );
}
