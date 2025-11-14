import { useTranslation } from "react-i18next";

Object.defineProperty(exports, "__esModule", { value: true });
const _default = CreateNewGameButton;
export { _default as default };

function CreateNewGameButton() {
  var t = (0, useTranslation)().t;
  return (
    <Link href="/new" id="createNewGameButton" target="_blank">
      <button className="text-2xl">
        <div className="flex justify-center rounded bg-primary-200 p-5 text-foreground hover:shadow-md">
          {t("Create New Game")}
        </div>
      </button>
    </Link>
  );
}
