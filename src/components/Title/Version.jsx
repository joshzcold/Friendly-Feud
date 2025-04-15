import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const Version = () => {
  const { t } = useTranslation();
  const version = process.env.NEXT_PUBLIC_APP_VERSION;

  if (!version) return null;

  return (
    <div className="absolute bottom-2 right-2">
      <Link
        href={'https://github.com/joshzcold/Friendly-Feud/releases'}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-secondary-900 hover:underline"
      >
        {t('Version')} {version}
      </Link>
    </div>
  );
};

export default Version;
