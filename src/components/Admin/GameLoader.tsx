import ToolTipIcon from "@/components/ui/tooltip";
import { ERROR_CODES } from "@/i18n/errorCodes";
import { handleCsvFile, handleJsonFile, isValidFileType } from "@/lib/utils";
import { FileUp } from "lucide-react";
import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface GameLoaderProps {
  gameSelector: string[];
  send: (data: any) => void;
  setCsvFileUpload: Dispatch<SetStateAction<File>>;
  setCsvFileUploadText: Dispatch<SetStateAction<string>>;
}

const GameLoader = ({ gameSelector, send, setCsvFileUpload, setCsvFileUploadText }: GameLoaderProps) => {
  const [selectedGame, setSelectedGame] = useState("");
  const MAX_SIZE_MB = process.env.NEXT_PUBLIC_MAX_CSV_UPLOAD_SIZE_MB
    ? parseInt(process.env.NEXT_PUBLIC_MAX_CSV_UPLOAD_SIZE_MB, 10) // type safety
    : 2; // default to 2MB
  const { i18n, t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleGameUpload() {
    let file = fileInputRef.current?.files?.[0];
    if (file) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        console.error("This csv file is too large");
        toast.error(t(ERROR_CODES.CSV_TOO_LARGE));
        return;
      }
    }

    const allowedTypes = {
      json: {
        pattern: /^application\/(json|.*\+json)$/,
        handler: (file: File) =>
          handleJsonFile(file, {
            t,
            send,
          }),
      },
      csv: {
        pattern: /^(text\/csv|application\/(vnd\.ms-excel|csv|x-csv|text-csv))$/,
        handler: (file: File) =>
          handleCsvFile(file, {
            t,
            setCsvFileUpload,
            setCsvFileUploadText,
          }),
      },
    };

    const fileType = isValidFileType(file, allowedTypes);
    if (!fileType || !file) {
      toast.error(t(ERROR_CODES.UNKNOWN_FILE_TYPE));
      return;
    }

    const fileExtension = file.name.toLowerCase().split(".").pop();
    allowedTypes[fileExtension as keyof typeof allowedTypes].handler(file);

    console.debug(file);

    // allow same file to be selected again
    fileInputRef.current!.value = "";
  }
  return (
    <div className="flex flex-col rounded  border-2">
      <div className="flex translate-y-3 flex-row  items-center justify-center space-x-5 p-2">
        {gameSelector.length > 0 ? (
          <div>
            <select
              id="gameSelector"
              value={selectedGame}
              className="rounded border-2 bg-secondary-500 text-foreground"
              onChange={(e) => {
                setSelectedGame(e.target.value);
                send({
                  action: "load_game",
                  file: e.target.value,
                  lang: i18n.language,
                });
              }}
            >
              <option disabled value="">
                {t("Select question set")}
              </option>
              {gameSelector.map((value, index) => (
                <option key={`set-${index}`} value={value}>
                  {value.replace(".json", "")}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div id="gamePickerFileUploadButton">
          <label htmlFor="gamePickerFileUpload">
            <div className="flow-row flex items-center space-x-2">
              <ToolTipIcon
                Icon={FileUp}
                size={32}
                cursor="pointer"
                message={`CSV ${t("Expected format")}: ${t("Question")}, ${t("Answer")}, ${t("Points")}, ${t("Answer")}, ${t("Points")} ...`}
              />
              <div>
                <p className="text-s text-secondary-900">{t("upload game")}</p>
                <p className="text-xs text-secondary-900">.json, .csv</p>
              </div>
            </div>
          </label>
          {/* CSV Upload */}
          <input
            className="hidden"
            type="file"
            accept=".json, .csv"
            id="gamePickerFileUpload"
            ref={fileInputRef}
            onChange={handleGameUpload}
          />
        </div>
      </div>
      <div className="flex flex-row">
        <span className="inline shrink translate-x-3 translate-y-3 bg-background px-2 text-foreground">
          {t("Load Game")}
        </span>
        <div className="grow" />
      </div>
    </div>
  );
};

export default GameLoader;
