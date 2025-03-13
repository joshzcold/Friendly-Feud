import { useTranslation } from "react-i18next";

function HideGameQuestions({ game, setGame, send }) {
  const { t } = useTranslation();

  let textColor = game.settings.hide_questions ? "text-foreground" : "text-foreground";
  let buttonColor = game.settings.hide_questions ? "bg-secondary-500" : "bg-secondary-300";
  let textContent = game.settings.hide_questions ? t("Show questions") : t("Hide questions");
  let disabledOpacity = game.is_final_round ? "opacity-50" : "";

  return (
    <button
      id="hideQuestionsInput"
      className={`rounded border-4 p-10 text-2xl ${textColor} ${buttonColor} ${disabledOpacity}`}
      onClick={() => {
        game.settings.hide_questions = !game.settings.hide_questions;
        setGame((prv) => ({ ...prv }));
        send({ action: "data", data: game });
      }}
      type="checkbox"
      disabled={game.is_final_round}
    >
      {textContent}
    </button>
  );
}

export default HideGameQuestions;
