import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import Version from "@/components/Title/Version";
import { Coffee, Mail } from "lucide-react";
import Link from "next/link";

interface LinkItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
}

const LinkItem = ({ href, label, icon, external = false }: LinkItemProps) => {
  const { t } = useTranslation();
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-2"
    >
      <p className="text-sm capitalize text-secondary-900">{t(label)}</p>
      {icon}
    </Link>
  );
};

export default function Footer() {
  return (
    <div className="absolute bottom-0 left-0 min-w-full bg-background">
      <hr />
      <div className="flex flex-row items-center justify-evenly py-3">
        <LinkItem
          href="https://github.com/joshzcold/Friendly-Feud"
          label="source code"
          external
          icon={
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="gray" width="24" height="24">
              <title>GitHub</title>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          }
        />
        <LinkItem href="mailto:joshzcold@gmail.com" label="email" icon={<Mail color="gray" />} />
        <LinkItem href="https://liberapay.com/joshuaCold" label="donate" external icon={<Coffee color="gray" />} />
      </div>
      <Version />
    </div>
  );
}
