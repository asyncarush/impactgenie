import { useTheme } from "next-themes";

export const useNextTheme = () => {
  const { theme } = useTheme();

  const getSpotlightColor = (color: string) => {
    if (theme === "dark") {
      switch (color) {
        case "red":
          return "rgba(248, 113, 113, 0.15)";
        case "purple":
          return "rgba(167, 139, 250, 0.15)";
        case "teal":
          return "rgba(45, 212, 191, 0.15)";
        case "amber":
          return "rgba(251, 191, 36, 0.15)";
        default:
          return "rgba(255, 255, 255, 0.05)";
      }
    } else {
      switch (color) {
        case "red":
          return "rgba(239, 68, 68, 0.1)";
        case "purple":
          return "rgba(139, 92, 246, 0.1)";
        case "teal":
          return "rgba(20, 184, 166, 0.1)";
        case "amber":
          return "rgba(245, 158, 11, 0.1)";
        default:
          return "rgba(0, 0, 0, 0.05)";
      }
    }
  };

  return { getSpotlightColor, theme };
};
