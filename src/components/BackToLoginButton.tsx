import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function BackToLoginButton() {
  const { t } = useTranslation();
  return (
    <Link href="/" id="backToLoginButton">
      <button className="text-lg">
        <div className="flex justify-center rounded bg-secondary-500 p-2 capitalize text-foreground hover:shadow-md">
          {t("back to login")}
        </div>
      </button>
    </Link>
  );
}
