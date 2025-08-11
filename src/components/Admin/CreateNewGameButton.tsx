import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function CreateNewGameButton() {
  const { i18n, t } = useTranslation();
  return (
    <Link href="/new" id="createNewGameButton">
      <button className="text-2xl">
        <div className="flex w-48 justify-center rounded bg-primary-200 p-2 hover:shadow-md">
          {t("Create New Game")}
        </div>
      </button>
    </Link>
  );
}
