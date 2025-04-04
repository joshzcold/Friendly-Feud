import { debounce } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function FinalRoundTitleChanger({ game, setGame, send }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row items-center space-x-5">
      <p className="text-xl text-foreground">{t("Final Round Title")}:</p>
      <input
        id="finalRoundTitleChangerInput"
        className="w-32 rounded border-4 bg-secondary-500 p-1 text-xl text-foreground placeholder:text-secondary-900"
        onChange={debounce((e) => {
          game.settings.final_round_title = e.target.value;
          setGame((prv) => ({ ...prv }));
          send({ action: "data", data: game });
        })}
        defaultValue={game.settings.final_round_title}
        placeholder={t("fast money")}
      ></input>
    </div>
  );
}

export default FinalRoundTitleChanger;
