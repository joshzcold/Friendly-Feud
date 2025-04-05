import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { ERROR_CODES } from "@/i18n/errorCodes";
import { Answer, FinalRound, FinalRoundAnswer, Game, Round, Settings } from "@/types/game";
import { TFunction } from "i18next";
// @ts-expect-error papaparse is not typed
import Papa from "papaparse";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import CSVRow from "./CSVRow";

export function csvStringToArray(data: string) {
  const parsedData = Papa.parse(data, {
    header: false,
    skipEmptyLines: true,
  });
  return parsedData.data;
}

/**
 * Verify the format <Question (string), Answer (string), Points (number), ...>
 * Verify the number of rounds doesn't exceed the amount of data
 */
function validateCsv(
  csvData: string[][],
  roundCount: number,
  roundFinalCount: number,
  noHeader: boolean,
  setError: Dispatch<SetStateAction<string | null>>,
  t: TFunction
) {
  let headerOffSet = noHeader ? 0 : 1;
  // the setting of rows is greater than the data provided
  if (roundCount + roundFinalCount + headerOffSet > csvData.length) {
    setError(t("Error: round and final round is greater than document has available."));
    return;
  }

  for (let r in csvData) {
    let index = parseInt(r) + headerOffSet;
    if (roundCount + roundFinalCount + headerOffSet < parseInt(r) || csvData[index] === undefined) {
      break;
    }
    let answer = true;
    colLoop: for (let i = 0; i < csvData[index].length; i++) {
      // Question doesn't need a format
      if (i === 0) {
        continue colLoop;
      }
      // Answer doesn't need a format
      if (answer) {
        answer = !answer;
        continue colLoop;
      } else {
        // Answer point needs to be a number
        if (csvData[index][i] && !/^\d+$/.test(csvData[index][i])) {
          setError(t(ERROR_CODES.CSV_INVALID_FORMAT));
          return;
        }
        answer = !answer;
      }
    }
  }
}

function csvToColdFriendlyFeudFormat(
  csvData: string[][],
  roundCount: number,
  roundFinalCount: number,
  noHeader: boolean,
  timer: number,
  timer2nd: number,
  send: (data: any) => void
) {
  let headerOffSet = noHeader ? 0 : 1;
  let gameTemplate: Partial<Game> & {
    rounds: Round[];
    final_round: FinalRound[];
    final_round_timers: number[];
  } = {
    settings: {} as Settings,
    rounds: [],
    final_round: [],
    final_round_timers: [timer, timer2nd],
  };

  for (let row = 0; row < csvData.length; row++) {
    let rowPush: Partial<Round> & { answers: Answer[] } = {
      answers: [],
      multiply: 1,
      question: "",
    };
    let finalRowPush: Partial<FinalRound> & { answers: FinalRoundAnswer[] } = {
      answers: [],
      question: "",
      selection: 0,
      points: 0,
      input: "",
      revealed: false,
    };
    let answer = true;
    let answerCount = 0;
    let index = row + headerOffSet;

    if (index >= csvData.length || index >= roundCount + roundFinalCount + headerOffSet) {
      break;
    }

    if (index < roundCount + headerOffSet) {
      colLoop: for (let col = 0; col < csvData[index].length; col++) {
        if (col === 0) {
          rowPush.question = csvData[index][col];
          continue colLoop;
        }
        if (answer) {
          rowPush.answers.push({
            ans: csvData[index][col],
            pnt: 0,
            trig: false,
          });
          answer = !answer;
        } else {
          rowPush.answers[answerCount].pnt = parseInt(csvData[index][col] || "0", 10);
          answerCount++;
          answer = !answer;
        }
      }
      if (rowPush.question) {
        gameTemplate.rounds.push(rowPush as Round);
      }
    } else {
      colLoop: for (let col = 0; col < csvData[index].length; col++) {
        if (col === 0) {
          finalRowPush.question = csvData[index][col];
          continue colLoop;
        }
        if (answer) {
          finalRowPush.answers.push([csvData[index][col], 0]);
          answer = !answer;
        } else {
          finalRowPush.answers[answerCount][1] = parseInt(csvData[index][col] || "0", 10);
          answerCount++;
          answer = !answer;
        }
      }
      if (finalRowPush.question) {
        gameTemplate.final_round.push(finalRowPush as FinalRound);
      }
    }
  }
  send({ action: "load_game", data: gameTemplate });
}

/**
 * If first time loading, then count up the initial count of round and final round
 *  so that users start with a round and final round count
 *  that is less than their CSV document.
 */
function initalizeCSVRoundCount(
  csvData: string[][],
  roundCount: number,
  setRoundCount: Dispatch<SetStateAction<number>>,
  roundFinalCount: number,
  setRoundFinalCount: Dispatch<SetStateAction<number>>,
  noHeader: boolean
) {
  if (roundCount < 0 || roundFinalCount < 0) {
    let headerOffSet = noHeader ? 0 : 1;
    let _roundCount = 0;
    let _roundCountDefaultLimit = 6;
    let _finalRoundCount = 0;
    let _finalRoundCountDefaultLimit = 4;
    for (let _ in csvData) {
      if (_roundCount < _roundCountDefaultLimit && _roundCount + headerOffSet < csvData.length) {
        _roundCount++;
      } else if (
        _finalRoundCount < _finalRoundCountDefaultLimit &&
        _finalRoundCount + _roundCount + headerOffSet < csvData.length
      ) {
        _finalRoundCount++;
      }
    }
    console.debug(_roundCount, _finalRoundCount, csvData.length);
    setRoundCount(_roundCount);
    setRoundFinalCount(_finalRoundCount);
  }
}

interface CSVLoaderProps {
  csvFileUpload: File;
  csvFileUploadText: string;
  setCsvFileUpload: Dispatch<SetStateAction<File | null>>;
  send: (data: any) => void;
}

export default function CSVLoader({ csvFileUpload, csvFileUploadText, setCsvFileUpload, send }: CSVLoaderProps) {
  const { t } = useTranslation();
  const csvData = useMemo(() => csvStringToArray(csvFileUploadText), [csvFileUploadText]);
  const [roundCount, setRoundCount] = useState(-1);
  const [roundFinalCount, setRoundFinalCount] = useState(-1);
  const [noHeader, setNoHeader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(20);
  const [timer2nd, setTimer2nd] = useState(25);
  useEffect(() => {
    setError(null);
    initalizeCSVRoundCount(csvData, roundCount, setRoundCount, roundFinalCount, setRoundFinalCount, noHeader);
    validateCsv(csvData, roundCount, roundFinalCount, noHeader, setError, t);
  }, [csvData, roundCount, roundFinalCount, noHeader, t]);
  let headerOffSet = noHeader ? 0 : 1;
  return (
    <div className="bg-opacity/50 fixed inset-0 size-full overflow-y-auto bg-gray-600">
      <div className="relative top-20 mx-auto flex w-3/4 flex-col space-y-5 rounded-md border bg-background p-5 shadow-lg">
        <div className="flex flex-row items-center space-x-2">
          <div className="w-4">
            <svg className="fill-current text-secondary-900" viewBox="0 0 384 512">
              <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm65.18 216.01H224v80c0 8.84-7.16 16-16 16h-32c-8.84 0-16-7.16-16-16v-80H94.82c-14.28 0-21.41-17.29-11.27-27.36l96.42-95.7c6.65-6.61 17.39-6.61 24.04 0l96.42 95.7c10.15 10.07 3.03 27.36-11.25 27.36zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z" />
            </svg>
          </div>
          <p className="text-foreground">{t("CSV file upload")}: </p>
          <div className="rounded bg-secondary-500 p-2">
            <p>{csvFileUpload.name}</p>
          </div>
          <hr />
        </div>
        {error ? (
          <div id="csvErrorText" className="space-y-2 rounded bg-failure-200 p-4">
            <p className="font-bold">{error}</p>
            <div className="space-y-1 text-sm">
              <p>{t("Expected format")}:</p>
              <p>• {t("Format Example")}</p>
              <p>• {t("Points must be numbers")}</p>
              <p>• {t("Example row")}: What is popular?, Pizza, 30, Burger, 25, Fries, 20</p>
            </div>
          </div>
        ) : null}
        <div className="space-y-2 rounded bg-secondary-300 p-4">
          <p className="font-semibold">{t("Format Guide")}:</p>
          <div className="space-y-1 text-sm">
            <div className="grid grid-cols-7 gap-2">
              <div className="rounded bg-secondary-500 p-2">{t("Question")}</div>
              <div className="rounded bg-success-200 p-2">{t("Answer")} 1</div>
              <div className="rounded bg-primary-200 p-2">{t("points")} 1</div>
              <div className="rounded bg-success-200 p-2">{t("Answer")} 2</div>
              <div className="rounded bg-primary-200 p-2">{t("points")} 2</div>
              <div className="rounded bg-success-200 p-2">...</div>
              <div className="rounded bg-primary-200 p-2">...</div>
            </div>
            <p className="mt-2 text-xs">{t("Each row follows this pattern. Points must be numbers.")}</p>
          </div>
        </div>
        <div className="flex h-96 flex-col overflow-x-scroll bg-secondary-500 p-2 ">
          {csvData.map((row: string[], roundCounter: number) => (
            <CSVRow
              key={`csvloader-round-${roundCounter}`}
              row={row}
              roundCounter={roundCounter}
              noHeader={noHeader}
              roundCount={roundCount}
              roundFinalCount={roundFinalCount}
            />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
          <div className="flex flex-row items-center space-x-5">
            <label htmlFor="csvSetNoHeaderInput">
              <p className="text-xl normal-case text-foreground">{t("No Header")}:</p>
            </label>
            <input
              id="csvSetNoHeaderInput"
              className="size-4 rounded bg-secondary-900 text-foreground"
              checked={noHeader}
              onChange={(e) => {
                setNoHeader(e.target.checked);
              }}
              type="checkbox"
            ></input>
          </div>
          <div className="flex flex-row items-center space-x-5">
            <label htmlFor="csvSetRoundCountInput">
              <p className="text-xl normal-case text-foreground">{t("Rounds")}:</p>
            </label>
            <input
              id="csvSetRoundCountInput"
              className="w-24 rounded bg-secondary-300 p-2 text-foreground"
              onChange={(e) => {
                let value = parseInt(e.target.value);
                // Rounds must always be atleast 1
                if (value === 0) {
                  value = 1;
                }
                // Don't allow more rounds than available data
                if (value + roundFinalCount + headerOffSet > csvData.length) {
                  return;
                }
                setRoundCount(value);
              }}
              type="number"
              value={roundCount}
              min="1"
            ></input>
          </div>
          <div className="flex flex-row items-center space-x-5">
            <label htmlFor="csvSetFinalRoundCountInput">
              <p className="text-xl normal-case text-foreground">{t("Final Rounds")}:</p>
            </label>
            <input
              id="csvSetFinalRoundCountInput"
              className="w-24 rounded bg-secondary-300 p-2 text-foreground"
              onChange={(e) => {
                let value = parseInt(e.target.value);
                // Don't allow more rounds than available data
                if (value + roundCount + headerOffSet > csvData.length) {
                  return;
                }
                setRoundFinalCount(value);
              }}
              value={roundFinalCount}
              type="number"
              min="0"
            ></input>
          </div>
          <div className="flex flex-row items-center space-x-5">
            <label htmlFor="csvFinalRoundTimerInput">
              <p className="text-xl normal-case text-foreground">{t("Final Round Timer")}:</p>
            </label>
            <input
              id="csvFinalRoundTimerInput"
              className="w-24 rounded bg-secondary-300 p-2 text-foreground"
              onChange={(e) => {
                let value = parseInt(e.target.value);
                setTimer(value);
              }}
              value={timer}
              type="number"
              min="0"
            ></input>
          </div>
          <div className="flex flex-row items-center space-x-5">
            <label htmlFor="csvFinalRound2ndTimerInput">
              <p className="text-xl normal-case text-foreground">{t("2nd Final Round Timer")}:</p>
            </label>
            <input
              id="csvFinalRound2ndTimerInput"
              className="w-24 rounded bg-secondary-300 p-2 text-foreground"
              onChange={(e) => {
                let value = parseInt(e.target.value);
                setTimer2nd(value);
              }}
              value={timer2nd}
              type="number"
              min="0"
            ></input>
          </div>
        </div>
        <div className="flex flex-row space-x-5">
          <button id="csvCancelUploadButton" className="text-2xl">
            <div
              className="flex w-48 justify-center rounded bg-secondary-500 p-2 hover:bg-secondary-200"
              onClick={() => {
                setError(null);
                setCsvFileUpload(null);
              }}
            >
              {t("Cancel")}
            </div>
          </button>
          {!error ? (
            <button
              className="text-2xl"
              id="csvFileUploadSubmitButton"
              onClick={() => {
                csvToColdFriendlyFeudFormat(csvData, roundCount, roundFinalCount, noHeader, timer, timer2nd, send);
                setCsvFileUpload(null);
              }}
            >
              <div className="flex w-48 justify-center rounded bg-success-200 p-2 hover:shadow-md">{t("Submit")}</div>
            </button>
          ) : (
            <button id="csvFileUploadSubmitButtonDisabled" className="cursor-default text-2xl">
              <div className="flex w-48 justify-center rounded bg-secondary-500 p-2 text-secondary-900">
                {t("Submit")}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
