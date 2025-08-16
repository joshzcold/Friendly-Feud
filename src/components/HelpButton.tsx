import Link from "next/link";
import { useTranslation } from "react-i18next";

interface HelpButtonProps {
  doc: String;
}

export default function HelpButton({ doc }: HelpButtonProps) {
  const { i18n, t } = useTranslation();
  return (
    <Link href={"/docs" + `/${i18n.language}` + doc} id="helpDocsButton" target="_bank">
      <button className="text-lg">
        <div className="rounded:md flex w-32 justify-center bg-secondary-500 p-2 capitalize text-foreground hover:shadow-md">
          {t("help")}
        </div>
      </button>
    </Link>
  );
}
