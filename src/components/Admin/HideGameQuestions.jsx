import { useTranslation } from "react-i18next";

function HideGameQuestions({ game, setGame, send }) {
  const { t } = useTranslation();

  let textColor = game.settings.hide_questions ? "text-foreground" : "text-foreground";
  let buttonColor = game.settings.hide_questions ? "bg-secondary-500" : "bg-secondary-300";
  let textContent = game.settings.hide_questions ? t("Show questions") : t("Hide questions");

  return (
    <button
      id="hideQuestionsInput"
      className={`border-4 text-2xl ${textColor} ${buttonColor} rounded p-10`}
      onClick={() => {
        game.settings.hide_questions = !game.settings.hide_questions;
        setGame((prv) => ({ ...prv }));
        send({ action: "data", data: game });
      }}
      type="checkbox"
    >
      {textContent}
    </button>
  );
}

export default HideGameQuestions;
