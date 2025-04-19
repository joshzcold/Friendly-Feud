import { Answer, Game, Round } from "@/types/game";
import { toast } from "sonner";

// Translation function type
type TranslateFunction = (key: string, options?: Record<string, any>) => string;

// HandleJsonFile props type
interface HandleJsonFileOptions {
  t: TranslateFunction;
  send: (payload: { action: string; data: any }) => void;
}

// HandleCsvFile props type
interface HandleCsvFileOptions {
  t: TranslateFunction;
  setCsvFileUpload: (file: File) => void;
  setCsvFileUploadText: (text: string) => void;
}

// ValidateGameData props type
interface ValidateGameDataOptions {
  t: TranslateFunction;
}

// AllowedTypes interface
interface AllowedType {
  pattern: RegExp;
}

interface AllowedTypes {
  [extension: string]: AllowedType;
}

export function handleJsonFile(file: File, { t, send }: HandleJsonFileOptions): void {
  var reader = new FileReader();
  reader.readAsText(file, "utf-8");
  reader.onload = function (evt: ProgressEvent<FileReader>) {
    try {
      if (!evt.target?.result) {
        throw new Error("Failed to read file");
      }

      let data = JSON.parse(evt.target.result as string) as Game;
      let errors = validateGameData(data, { t });

      if (errors.length > 0) {
        toast.error(t("Game file error") + ":\n" + errors.join("\n"));
        return;
      }
      console.debug(data);
      send({ action: "load_game", data: data });
    } catch (e) {
      console.error("Invalid JSON file", e);
      toast.error(t(`Invalid JSON file: ${e}`));
    }
  };
  reader.onerror = function (evt: ProgressEvent<FileReader>) {
    console.error("error reading file");
    toast.error(t("error reading file"));
  };
}

export function handleCsvFile(file: File, { t, setCsvFileUpload, setCsvFileUploadText }: HandleCsvFileOptions): void {
  var reader = new FileReader();
  reader.readAsText(file, "utf-8");
  reader.onload = function (evt: ProgressEvent<FileReader>) {
    if (!evt.target?.result) {
      toast.error(t("error reading file"));
      return;
    }

    let lineCount = (evt.target.result as string).split("\n");
    if (lineCount.length > 30) {
      toast.error(t("This csv file is too large"));
    } else {
      setCsvFileUpload(file);
      setCsvFileUploadText(evt.target.result as string);
    }
  };
  reader.onerror = function (evt: ProgressEvent<FileReader>) {
    console.error("error reading file");
    toast.error(t("error reading file"));
  };
}

export function validateGameData(game: Game, { t }: ValidateGameDataOptions): string[] {
  let errors: string[] = [];
  if (game.rounds.length == 0) {
    errors.push(t("You need to create some rounds to save the game"));
  }
  game.rounds.forEach((r: Round, index: number) => {
    if (r.question === "") {
      errors.push(
        t("round number {{count, number}} has an empty question", {
          count: index + 1,
        })
      );
    }
    if (r.multiply === 0 || typeof r.multiply !== "number" || isNaN(Number(r.multiply))) {
      errors.push(
        t("round number {{count, number}} has no point multipler", {
          count: index + 1,
        })
      );
    }
    if (r.answers.length === 0) {
      errors.push(
        t("round number {{count, number}} has no answers", {
          count: index + 1,
        })
      );
    }
    r.answers.forEach((a: Answer, aindex: number) => {
      if (a.ans === "") {
        errors.push(
          t("round item {{count, number}} has empty answer at answer number {{answernum, number}}", {
            count: index + 1,
            answernum: aindex + 1,
          })
        );
      }
      if (a.pnt === 0 || typeof a.pnt !== "number" || isNaN(Number(a.pnt))) {
        errors.push(
          t("round item {{count, number}} has {{zero, number}} points answer number {{answernum, number}}", {
            count: index + 1,
            zero: 0,
            answernum: aindex + 1,
          })
        );
      }
    });
  });
  return errors;
}

export function isValidFileType(file: File, allowedTypes: AllowedTypes): boolean {
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split(".").pop() || "";

  if (!allowedTypes[fileExtension]) {
    return false;
  }

  const mimePattern = allowedTypes[fileExtension].pattern;
  return mimePattern.test(file.type);
}
