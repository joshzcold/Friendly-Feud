import { useTranslation } from "react-i18next";

export default function NoSession() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-10 text-center  h-1/2">
      <p className="text-foreground">{t("No game session. retry from the admin window")}</p>
      <button
        className="m-1 rounded-lg bg-secondary-500 p-2 font-bold uppercase shadow-md hover:bg-secondary-200"
        id="quitButton"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        {t("quit")}
      </button>
      <div className="text-sm text-secondary-700">
        <p className="font-semibold uppercase tracking-wide text-secondary-900">{t("Troubleshooting")}</p>
        <p>{t("If a browser extension blocks cookies or JavaScript, the game cannot create a session.")}</p>
        <p>{t("Try disabling extensions, allow cookies for this site, or open the game in another browser.")}</p>
      </div>
    </div>
  );
}
