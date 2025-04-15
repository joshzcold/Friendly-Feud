import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeProvider = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="default"
      value={{
        default: "default",
        darkTheme: "darkTheme",
        slate: "slate",
        educational: "educational",
        red: "red"
      }}
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider; 