import { debounce } from "@/lib/utils";
import { Game, WSEvent } from "@/src/types/game";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

interface FinalRoundButtonControlsProps {
  game: Game;
  send: (data: WSEvent) => void;
  setGame: Dispatch<SetStateAction<Game | null>>;
}

export default function FinalRoundButtonControls({ game, send, setGame }: FinalRoundButtonControlsProps) {
  const { t } = useTranslation();
  const controlRound = game.is_final_second ? game.final_round_2 : game.final_round;
  return controlRound?.map((x, i) => (
    <div
      key={`${game.is_final_second ? "final-round-2" : "final-round-1"}-question-${i}`}
      className="flex flex-col space-y-5 border-2 p-12"
    >
      <p className="text-3xl font-bold text-foreground">{x.question}</p>
      {game.is_final_second && (
        <div className="flex flex-row space-x-5 pb-2">
          {/* PARTNER'S ANSWER PROVIDED FINAL ROUND */}
          <div className="w-48 grow p-5 align-middle text-3xl text-foreground">
            <i>{t("Partner's Answer")}</i>: {game.final_round[i].input || `(${t("No Answer")})`}
          </div>
          {game.final_round[i].input && (
            <button
              id={`alreadyAnswered${i}Button`}
              className="grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
              onClick={() => send({ action: "duplicate" })}
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
          defaultValue={x.input}
          onChange={debounce((e: React.ChangeEvent<HTMLInputElement>) => {
            const xInput = e.target.value;
            setGame((prevGame) => {
              if (prevGame === null) {
                return prevGame;
              }

              const newValue = xInput;
              const propertyToUpdate = "input";

              const updatedGame = {
                ...prevGame,
                final_round: prevGame.is_final_second
                  ? prevGame.final_round
                  : prevGame.final_round.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    ),
                final_round_2: prevGame.is_final_second
                  ? prevGame.final_round_2.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    )
                  : prevGame.final_round_2,
              };

              send({ action: "data", data: updatedGame });

              return updatedGame;
            });
          })}
        />

        <button
          id={`finalRoundAnswer${i}RevealButton`}
          className="grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
          onClick={() => {
            setGame((prevGame) => {
              if (prevGame === null) {
                return prevGame;
              }

              const updateRoundOnReveal = (round: (typeof prevGame.final_round)[number], index: number) => {
                if (index !== i) return round;

                // Legacy compatibility: old state used non-negative selection before award.
                // Convert to pending form so reveal does not immediately show 0 points.
                if (round.points === 0 && round.selection >= 0) {
                  return { ...round, revealed: true, selection: -(round.selection + 1) };
                }

                return { ...round, revealed: true };
              };

              const updatedGame = {
                ...prevGame,
                final_round: prevGame.is_final_second
                  ? prevGame.final_round
                  : prevGame.final_round.map(updateRoundOnReveal),
                final_round_2: prevGame.is_final_second
                  ? prevGame.final_round_2.map(updateRoundOnReveal)
                  : prevGame.final_round_2,
              };

              send({ action: "data", data: updatedGame });
              send({ action: "final_reveal" });

              return updatedGame;
            });
          }}
        >
          {t("Reveal Answer")}
        </button>
      </div>
      <div className="flex flex-row space-x-5">
        {/* POINTS AWARDED FINAL ROUND */}
        <select
          id={`finalRoundAnswer${i}Selector`}
          value={x.selection >= 0 ? x.selection : -x.selection - 1}
          className="w-48 grow rounded border-4 bg-secondary-300 p-5 text-2xl text-foreground"
          onChange={(e) => {
            const xSelection = parseInt(e.target.value);
            setGame((prevGame) => {
              if (prevGame === null) {
                return prevGame;
              }

              const newValue = -(xSelection + 1);
              const propertyToUpdate = "selection";

              const updatedGame = {
                ...prevGame,
                final_round: prevGame.is_final_second
                  ? prevGame.final_round
                  : prevGame.final_round.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    ),
                final_round_2: prevGame.is_final_second
                  ? prevGame.final_round_2.map((round, index) =>
                      index === i ? { ...round, [propertyToUpdate]: newValue } : round
                    )
                  : prevGame.final_round_2,
              };

              send({ action: "data", data: updatedGame });

              return updatedGame;
            });
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
            setGame((prevGame) => {
              if (prevGame === null) {
                return prevGame;
              }

              const activeRounds = prevGame.is_final_second ? prevGame.final_round_2 : prevGame.final_round;
              const current = activeRounds[i];
              if (!current) {
                return prevGame;
              }

              const effectiveSelection = current.selection >= 0 ? current.selection : -current.selection - 1;
              const selectedIndex = effectiveSelection - 1;
              const selectedAnswer = effectiveSelection !== 0 ? current.answers[selectedIndex] : null;
              const xPoints = selectedAnswer ? Number(selectedAnswer[1]) || 0 : 0;

              const updatedGame = {
                ...prevGame,
                final_round: prevGame.is_final_second
                  ? prevGame.final_round
                  : prevGame.final_round.map((round, index) =>
                      index === i ? { ...round, points: xPoints, selection: effectiveSelection } : round
                    ),
                final_round_2: prevGame.is_final_second
                  ? prevGame.final_round_2.map((round, index) =>
                      index === i ? { ...round, points: xPoints, selection: effectiveSelection } : round
                    )
                  : prevGame.final_round_2,
              };

              send({ action: "data", data: updatedGame });
              send({
                action: effectiveSelection !== 0 ? "final_submit" : "mistake",
              });

              return updatedGame;
            });
          }}
        >
          {t("Award points")}
        </button>
      </div>
    </div>
  ));
}
