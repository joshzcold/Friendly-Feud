import { useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import ThemeSwitcher from "@/components/Admin/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { validateGameData } from "@/lib/utils";

export default function CreateGame() {
  const { t } = useTranslation();
  let gameTemplate = {
    settings: {},
    rounds: [
      {
        question: "",
        answers: [{ ans: "", pnt: 0 }],
        multiply: 1,
      },
    ],
    final_round: Array.from(Array(5), (x, index) => {
      return {
        question: `${t("question")} ${t("number", { count: index + 1 })}`,
        answers: [],
      };
    }),
    final_round_timers: [20, 25],
  };
  const [error, setError] = useState("");
  const [game, setGame] = useState(gameTemplate);
  const [theme, setTheme] = useState({
    settings: {},
  });

  console.debug(game);

  const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
  };

  if (typeof window !== "undefined") {
    document.body.className = game?.settings?.theme + " bg-background";
    // Prevent losing changes
    window.onbeforeunload = function () {
      return "";
    };
  }
  return (
    <div className={`${theme?.settings?.theme} min-h-screen bg-background`}>
      <div className="p-5">
        <div className="flex-col space-y-5 py-10">
          <div className="flex flex-row items-center space-x-5">
            <p className="text-foreground">{t("language")}:</p>
            <LanguageSwitcher />
            <ThemeSwitcher
              game={theme}
              setGame={setTheme}
              send={() => {
                console.debug("send from new");
              }}
            />
            <div className="flex flex-col rounded-lg  border-2">
              <div className="ml-4 translate-y-3 items-center p-2">
                <input type="file" className=" bg-secondary-300 text-foreground" id="gamePicker" accept=".json" />
                <button
                  id="gamePickerSubmitButton"
                  className="rounded-md bg-primary-200 p-2 hover:shadow-md"
                  onClick={() => {
                    var file = document.getElementById("gamePicker").files[0];
                    if (file) {
                      var reader = new FileReader();
                      reader.readAsText(file, "utf-8");
                      reader.onload = function (evt) {
                        let data = JSON.parse(evt.target.result);
                        console.debug(data);

                        data.final_round == null ? (data.final_round = gameTemplate.final_round) : null;
                        data.rounds == null ? (data.rounds = gameTemplate.rounds) : null;
                        data.final_round_timers == null
                          ? (data.final_round_timers = gameTemplate.final_round_timers)
                          : null;
                        data.settings == null ? (data.settings = gameTemplate.settings) : null;
                        setGame(data);
                      };
                      reader.onerror = function (evt) {
                        console.error("error reading file");
                      };
                    }
                  }}
                >
                  {t("submit")}
                </button>
              </div>
              <div className="flex flex-row">
                <span className="inline shrink translate-x-3 translate-y-3 bg-background px-2 text-foreground">
                  {t("Edit Existing Game")}
                </span>
                <div className="grow"></div>
              </div>
            </div>
          </div>
          <p className="text-3xl text-foreground">{t("rounds")}</p>
          <div className="flex flex-col space-y-3 border-2 p-3">
            {game.rounds.map((r, index) => (
              <div key={`round-${index}`} className="flex flex-col space-y-3 border-2 p-3">
                <div className="flex flex-row space-x-3">
                  <input
                    id={`round${index}QuestionInput`}
                    className="w-full border-2 bg-secondary-300 p-2 text-foreground"
                    value={r.question}
                    placeholder={t("question")}
                    onChange={(e) => {
                      r.question = e.target.value;
                      setGame((prv) => ({ ...prv }));
                    }}
                  />
                  <input
                    id={`round${index}QuestionMultiplierInput`}
                    type="number"
                    min="1"
                    className="w-15 border-2 bg-secondary-300 p-2 text-foreground"
                    value={r.multiply}
                    placeholder={t("multiplier")}
                    onChange={(e) => {
                      let value = parseInt(e.target.value);
                      if (value === 0) {
                        value = 1;
                      }
                      r.multiply = value;
                      setGame((prv) => ({ ...prv }));
                    }}
                  />
                </div>
                <div className="border-2 p-2">
                  {r.answers.map((a, ain) => (
                    <div className="flex flex-row space-x-3 pb-2" key={`round-${index}-answer-${ain}`}>
                      <input
                        id={`round${index}Answer${ain}NameInput`}
                        className="border-2 bg-secondary-300 p-2 text-foreground"
                        value={a.ans}
                        placeholder={t("Answer")}
                        onChange={(e) => {
                          a.ans = e.target.value;
                          setGame((prv) => ({ ...prv }));
                        }}
                      />
                      <input
                        id={`round${index}Answer${ain}PointsInput`}
                        type="number"
                        min="0"
                        className="border-2 bg-secondary-300 p-2 text-foreground"
                        value={a.pnt}
                        placeholder={t("points")}
                        onChange={(e) => {
                          a.pnt = parseInt(e.target.value);
                          setGame((prv) => ({ ...prv }));
                        }}
                      />
                      <button
                        id={`round${index}Answer${ain}RemoveButton`}
                        onClick={() => {
                          r.answers.splice(ain, 1);
                          setGame((prv) => ({ ...prv }));
                        }}
                        className="bg-failure-200 px-3 text-xl hover:shadow-md"
                      >
                        -
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-row space-x-3 py-2">
                  <button
                    id={`round${index}AnswerAddButton`}
                    onClick={() => {
                      r.answers.push({ ans: "", pnt: 0 });
                      setGame((prv) => ({ ...prv }));
                    }}
                    className="text-md rounded-md bg-success-200 px-3 py-1 hover:shadow-md"
                  >
                    {t("Answer")} +
                  </button>
                  <button
                    id={`round${index}AnswerRemoveButton`}
                    onClick={() => {
                      game.rounds.splice(index, 1);
                      setGame((prv) => ({ ...prv }));
                    }}
                    className="text-md rounded-md bg-failure-200 px-3 py-1 hover:shadow-md"
                  >
                    {t("round")} -
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-5">
              <button
                id="roundAddButton"
                onClick={() => {
                  game.rounds.push({
                    question: "",
                    answers: [{ ans: "", pnt: 0 }],
                    multiply: 1,
                  });
                  setGame((prv) => ({ ...prv }));
                }}
                className="text-md rounded-md bg-success-200 px-3 py-1 hover:shadow-md"
              >
                {t("round")} +
              </button>
            </div>
          </div>
        </div>

        <div className="flex-col space-y-5 py-10">
          <div className="flex flex-row items-end space-x-10">
            <p className="text-3xl text-foreground">{t("Fast Money")}</p>
            <div>
              <p id="finalRound1TimerText" className="text-secondary-900">
                {t("timer")} {t("number", { count: 1 })}
              </p>
              <input
                id="finalRound1TimerInput"
                type="number"
                min="0"
                className="border-2 bg-secondary-300 p-2 text-foreground"
                value={game.final_round_timers[0]}
                placeholder={`${t("timer")} ${t("number", { count: 1 })}`}
                onChange={(e) => {
                  game.final_round_timers[0] = parseInt(e.target.value);
                  setGame((prv) => ({ ...prv }));
                }}
              />
            </div>
            <div>
              <p id="finalRound2TimerText" className="text-secondary-900">
                {t("timer")} {t("number", { count: 2 })}
              </p>
              <input
                id="finalRound2TimerInput"
                type="number"
                min="0"
                className="border-2 bg-secondary-300 p-2 text-foreground"
                value={game.final_round_timers[1]}
                placeholder={`${t("timer")} ${t("number", { count: 2 })}`}
                onChange={(e) => {
                  game.final_round_timers[1] = parseInt(e.target.value);
                  setGame((prv) => ({ ...prv }));
                }}
              />
            </div>
          </div>
          <div className="border-2 p-3">
            {game.final_round.map((q, qin) => (
              <div key={`final-round-${qin}`} className="flex flex-col space-y-2 pt-5">
                <input
                  id={`finalRoundQuestion${qin}Input`}
                  className="border-2 bg-secondary-300 p-2 text-foreground"
                  value={q.question}
                  onChange={(e) => {
                    q.question = e.target.value;
                    setGame((prv) => ({ ...prv }));
                  }}
                />
                <div className="border-2 p-3">
                  {q.answers.map((a, ain) => (
                    <div className="flex flex-row space-x-3 pb-2" key={`final-round-${qin}-answer-${ain}`}>
                      <input
                        id={`finalRoundQuestion${qin}Answer${ain}Input`}
                        className="border-2 bg-secondary-300 p-2 text-foreground"
                        value={a[0]}
                        placeholder={t("Answer")}
                        onChange={(e) => {
                          a[0] = e.target.value;
                          setGame((prv) => ({ ...prv }));
                        }}
                      />
                      <input
                        id={`finalRoundQuestion${qin}AnswerPoints${ain}Input`}
                        type="number"
                        min="0"
                        className="border-2 bg-secondary-300 p-2 text-foreground"
                        value={a[1]}
                        placeholder={t("points")}
                        onChange={(e) => {
                          a[1] = parseInt(e.target.value);
                          setGame((prv) => ({ ...prv }));
                        }}
                      />
                      <button
                        id={`finalRoundQuestion${qin}RemoveAnswerButton`}
                        onClick={() => {
                          q.answers.splice(ain, 1);
                          setGame((prv) => ({ ...prv }));
                        }}
                        className="bg-failure-200 px-3 text-xl hover:shadow-md"
                      >
                        -
                      </button>
                    </div>
                  ))}
                  <button
                    id={`finalRoundQuestion${qin}AddAnswerButton`}
                    onClick={() => {
                      q.answers.push(["", ""]);
                      setGame((prv) => ({ ...prv }));
                    }}
                    className="text-md rounded-md bg-success-200 px-3 py-1 hover:shadow-md"
                  >
                    {t("Answer")} +
                  </button>
                  <div className="pt-5">
                    <button
                      id={`finalRoundQuestion${qin}RemoveQuestionButton`}
                      onClick={() => {
                        game.final_round.splice(qin, 1);
                        setGame((prv) => ({ ...prv }));
                      }}
                      className="text-md rounded-md bg-failure-200 px-3 py-1 hover:shadow-md"
                    >
                      {t("Question")} -
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-5">
              <button
                id={`finalRoundAddQuestionButton`}
                onClick={() => {
                  game.final_round.push({
                    question: `${t("question")} ${t("number", {
                      count: game.final_round.length + 1,
                    })}`,
                    answers: [],
                  });
                  setGame((prv) => ({ ...prv }));
                }}
                className="text-md rounded-md bg-success-200 px-3 py-1 hover:shadow-md"
              >
                {t("Question")} +
              </button>
            </div>
          </div>
        </div>

        {error !== "" ? (
          <div className="rounded-md bg-failure-500 p-2">
            <p className="font-semibold uppercase text-white">{t("error")}:</p>
            <p id="errorText" className="text-white">
              {error}
            </p>
          </div>
        ) : null}

        <div className="flex flex-row space-x-5 pt-5">
          <button
            id="newGameSubmitButton"
            className="rounded-md bg-success-200 p-2 px-10 hover:shadow-md"
            onClick={() => {
              // ERROR checking
              let error = validateGameData(game, { t });
              if (error.length === 0) {
                setError("");
                downloadToFile(JSON.stringify(game), `${t("new-cold-feud")}.json`, "text/json");
              } else {
                console.error(error);
                setError(error.join(", "));
              }
            }}
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
