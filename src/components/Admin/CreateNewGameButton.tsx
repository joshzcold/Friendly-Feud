import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function CreateNewGameButton() {
  const { t } = useTranslation();
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
