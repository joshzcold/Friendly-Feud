import { useTranslation } from "react-i18next";

export default function NoSession() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-10">
      <p>{t("No game session. retry from the admin window")}</p>
      <button
        className="m-1 rounded-lg bg-secondary-500 p-2 font-bold uppercase shadow-md hover:bg-secondary-200"
        id="quitButton"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        {t("quit")}
      </button>
    </div>
  );
}
