import { useTheme } from "next-themes";
import { Toaster } from "sonner";

function ToasterWithTheme({ ...props }) {
  const { theme } = useTheme();

  // Map custom theme names to "light" or "dark" for Sonner
  const themeMap = {
    default: "light",
    darkTheme: "dark",
    slate: "dark",
    educational: "light",
    red: "dark",
  };

  const sonnerTheme = themeMap[theme] || "light";

  return <Toaster theme={sonnerTheme} richColors {...props} />;
}

export default ToasterWithTheme;
