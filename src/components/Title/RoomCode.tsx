import { useTranslation } from "react-i18next";

interface RoomCodeProps {
  code: string;
}

export default function RoomCode({ code }: RoomCodeProps) {
  const { t } = useTranslation();
  if (!code) return null;

  return (
    <div className="flex flex-row items-center justify-center text-center">
      <div className="flex h-fit flex-col items-center rounded-xl bg-secondary-500 shadow-lg transition-transform xl:p-4 2xl:p-6">
        <div className={`${process.env.NEXT_PUBLIC_TITLE_URL ? "" : "p-8"}`}>
          <p className="text-6xl font-bold  text-foreground" id="roomCodeText">
            {code}
          </p>
          <p className="text-xl font-semibold text-foreground">{t("Room Code")}</p>
        </div>
        {process.env.NEXT_PUBLIC_TITLE_URL && (
          <>
            <hr className="my-2 w-full border-t-2 border-secondary-900" />
            <span className="rounded-xl bg-secondary-500 p-6 pt-0 text-4xl text-foreground transition-transform duration-200">
              {t("Join at")} <span className="font-bold">{process.env.NEXT_PUBLIC_TITLE_URL}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
