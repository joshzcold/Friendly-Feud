import { Languages } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function LanguageSwitcher({ onChange }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex items-center gap-4 ">
      <Languages color="gray" />
      <select
        id="languageInput"
        className="w-full rounded-lg bg-secondary-300 p-2 capitalize text-foreground sm:w-fit"
        value={i18n.language}
        onChange={
          onChange
            ? onChange
            : (e) => {
                i18n.changeLanguage(e.target.value);
              }
        }
      >
        <option value="en">English ({t("english")})</option>
        <option value="es">Español ({t("spanish")})</option>
        <option value="id">Indonesian ({t("indonesian")})</option>
        <option value="et">Estonian ({t("estonian")})</option>
        <option value="fr">Français ({t("french")})</option>
      </select>
    </div>
  );
}
