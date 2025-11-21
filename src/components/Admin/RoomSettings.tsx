import CreateNewGameButton from "@/components/Admin/CreateNewGameButton";
import GameLoader from "@/components/Admin/GameLoader";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import HelpButton from "../HelpButton";
import { WSEvent } from "@/src/types";

interface RoomSettingsProps {
  room: string;
  gameSelector: string[];
  send: (data: WSEvent) => void;
  setCsvFileUpload: Dispatch<SetStateAction<File | null>>;
  setCsvFileUploadText: Dispatch<SetStateAction<string>>;
  quitGame: (host: boolean) => void;
}

export default function RoomSettings({
  room,
  gameSelector,
  send,
  setCsvFileUpload,
  setCsvFileUploadText,
  quitGame,
}: RoomSettingsProps) {
  const { i18n, t } = useTranslation();
  return (
    <div className="min-h-full">
      {/* ROOM CODE TEXT */}
      <p id="roomCodeText" className="p-4 text-center text-8xl font-semibold uppercase text-foreground">
        {room}
      </p>
      <hr />
      <div className="flex flex-row items-center justify-evenly p-5">
        {/* ADMIN BUTTONS */}
        <Link href="/game" target="_blank" id="openGameWindowButton">
          <button className="text-2xl">
            <div className="flex justify-center rounded bg-success-300 p-5 text-foreground hover:shadow-md">
              {t("Open Game Window")}
            </div>
          </button>
        </Link>
        <CreateNewGameButton />
        <HelpButton doc="/help" />
        <button id="quitButton" className="text-2xl" onClick={() => quitGame(true)}>
          <div className="flex w-32 justify-center rounded bg-failure-200 p-2 text-foreground hover:shadow-md">
            {t("Quit")}
          </div>
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
  );
}
