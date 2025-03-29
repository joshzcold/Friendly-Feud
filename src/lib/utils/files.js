import { toast } from "sonner";

export function handleJsonFile(file, { t, send }) {
  var reader = new FileReader();
  reader.readAsText(file, "utf-8");
  reader.onload = function (evt) {
    try {
      let data = JSON.parse(evt.target.result);
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
  reader.onerror = function (evt) {
    console.error("error reading file");
    toast.error(t("error reading file"));
  };
}

export function handleCsvFile(file, { t, setCsvFileUpload, setCsvFileUploadText }) {
  var reader = new FileReader();
  reader.readAsText(file, "utf-8");
  reader.onload = function (evt) {
    let lineCount = evt.target.result.split("\n");
    if (lineCount.length > 30) {
      toast.error(t("This csv file is too large"));
    } else {
      setCsvFileUpload(file);
      setCsvFileUploadText(evt.target.result);
    }
  };
  reader.onerror = function (evt) {
    console.error("error reading file");
    toast.error(t("error reading file"));
  };
}

export function validateGameData(game, { t }) {
  let errors = [];
  if (game.rounds.length == 0) {
    errors.push(t("You need to create some rounds to save the game"));
  }
  game.rounds.forEach((r, index) => {
    if (r.question === "") {
      errors.push(
        t("round number {{count, number}} has an empty question", {
          count: index + 1,
        })
      );
    }
    if (r.multiply === "" || r.multiply === 0 || isNaN(r.multiply)) {
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
    r.answers.forEach((a, aindex) => {
      if (a.ans === "") {
        errors.push(
          t("round item {{count, number}} has empty answer at answer number {{answernum, number}}", {
            count: index + 1,
            answernum: aindex + 1,
          })
        );
      }
      if (a.pnt === 0 || a.pnt === "" || isNaN(a.pnt)) {
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

export function isValidFileType(file, allowedTypes) {
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split(".").pop();

  if (!allowedTypes[fileExtension]) {
    return false;
  }

  const mimePattern = allowedTypes[fileExtension].pattern;
  return mimePattern.test(file.type);
}
