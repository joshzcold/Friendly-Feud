import Link from "next/link";
import { useTranslation } from "react-i18next";

interface HelpButtonProps {
  doc: String;
  textSize?: String;
  padding?: String;
}

export default function HelpButton({ doc, textSize, padding }: HelpButtonProps) {
  const { i18n, t } = useTranslation();
  return (
    <Link href={"/docs" + `/${i18n.language}` + doc} id="helpDocsButton" target="_blank">
      <button className={`${textSize ?? "text-2xl"}`}>
        <div
          className={`flex justify-center rounded bg-secondary-500 ${padding ?? "p-5"} capitalize text-foreground hover:shadow-md`}
        >
          {t("help")}
        </div>
      </button>
    </Link>
  );
}
