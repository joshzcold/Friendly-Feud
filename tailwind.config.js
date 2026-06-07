module.exports = {
  important: true,
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("tailwindcss-themer")({
      defaultTheme: {
        extend: {
          colors: {
            background: "white",
            success: {
              900: "#14532D",
              700: "#15803D",
              500: "#22C55E",
              300: "#86EFAC",
              200: "#BBF7D0",
            },
            secondary: {
              900: "#A1A1AA",
              700: "#D4D4D8",
              500: "#E4E4E7",
              300: "#F4F4F5",
              200: "#FAFAFA",
            },
            failure: {
              900: "#7F1D1D",
              700: "#B91C1C",
              500: "#EF4444",
              300: "#FCA5A5",
              200: "#FECACA",
            },
            warning: {
              900: "#713F12",
              700: "#A16207",
              500: "#EAB308",
              200: "#FEF08A",
            },
            primary: {
              900: "#1E3A8A",
              700: "#1D4ED8",
              500: "#6366F1",
              300: "#93C5FD",
              200: "#BFDBFE",
            },
            foreground: "black",
            fastm: {
              text: "white",
              holder: "black",
              background: "blue",
            },
          },
        },
      },
      themes: [
        {
          name: "darkTheme",
          extend: {
            colors: {
              background: "#18181B",
              success: {
                900: "#365314",
                700: "#3F6212",
                500: "#4D7C0F",
                300: "#65A30D",
                200: "#84CC16",
              },
              secondary: {
                200: "#0F172A",
                300: "#1E293B",
                500: "#334155",
                700: "#475569",
                900: "#64748B",
              },
              failure: {
                900: "#7C2D12",
                700: "#9A3412",
                500: "#C2410C",
                300: "#EA580C",
                200: "#F97316",
              },
              warning: {
                900: "#713F12",
                700: "#A16207",
                500: "#EAB308",
                200: "#FEF08A",
              },
              primary: {
                900: "#1E3A8A",
                700: "#1E40AF",
                500: "#1D4ED8",
                300: "#2563EB",
                200: "#3B82F6",
              },
              foreground: "white",
              fastm: {
                text: "white",
                holder: "#0F172A",
                background: "black",
              },
            },
          },
        },
        {
          name: "slate",
          extend: {
            colors: {
              background: "#18181B",
              success: {
                200: "#78716C",
                300: "#78716C",
                500: "#78716C",
                700: "#78716C",
                900: "#78716C",
              },
              secondary: {
                200: "#1C1917",
                300: "#292524",
                500: "#44403C",
                700: "#57534E",
                900: "#78716C",
              },
              failure: {
                900: "#1C1917",
                700: "#292524",
                500: "#44403C",
                300: "#57534E",
                200: "#78716C",
              },
              warning: {
                900: "#1C1917",
                700: "#292524",
                500: "#44403C",
                300: "#57534E",
                200: "#78716C",
              },
              primary: {
                900: "#1C1917",
                700: "#292524",
                500: "#44403C",
                300: "#57534E",
                200: "#78716C",
              },
              foreground: "white",
              fastm: {
                text: "white",
                holder: "#18181B",
                background: "black",
              },
            },
          },
        },
        {
          name: "educational",
          extend: {
            colors: {
              background: "#fffbf0",
              success: {
                900: "#454534",
                700: "#5c5c46",
                500: "#75755e",
                300: "#858569",
                200: "#9B9B7A",
              },
              secondary: {
                200: "#E5C59E",
                300: "#c9ab85",
                500: "#a88e6d",
                700: "#856f55",
                900: "#735b3f",
              },
              failure: {
                200: "#D9AE94",
                300: "#ad856d",
                500: "#8a654e",
                700: "#6b4630",
                900: "#613a23",
              },
              warning: {
                900: "#F8D488",
                700: "#dbb972",
                500: "#ad8f50",
                300: "#8c7035",
                200: "#8a6924",
              },
              primary: {
                200: "#f5b182",
                300: "#d1a98c",
                500: "#d1a98c",
                700: "#b08e76",
                900: "#997B66",
              },
              foreground: "black",
              fastm: {
                text: "white",
                holder: "#997B66",
                background: "black",
              },
            },
          },
        },
        {
          name: "red",
          extend: {
            colors: {
              background: "#2A070B",
              success: {
                900: "#14532D",
                700: "#15803D",
                500: "#22C55E",
                300: "#86EFAC",
                200: "#BBF7D0",
              },
              secondary: {
                200: "#3D0B12",
                300: "#58111B",
                500: "#7B2C35",
                700: "#9F3A46",
                900: "#F5A3AD",
              },
              failure: {
                900: "#5F0A12",
                700: "#8E1521",
                500: "#C94343",
                300: "#E35D6A",
                200: "#F28A94",
              },
              warning: {
                900: "#713F12",
                700: "#A16207",
                500: "#EAB308",
                200: "#FEF08A",
              },
              primary: {
                900: "#5F0A12",
                700: "#8E1521",
                500: "#C94343",
                300: "#E35D6A",
                200: "#F28A94",
              },
              foreground: "white",
              fastm: {
                text: "white",
                holder: "#5F0A12",
                background: "#2A070B",
              },
            },
          },
        },
        {
          name: "chromaKey",
          extend: {
            colors: {
              background: "#00FF00",
              success: {
                900: "#005E00",
                700: "#008F00",
                500: "#00C800",
                300: "#7AFF7A",
                200: "#B8FFB8",
              },
              secondary: {
                200: "#00FF00",
                300: "#00E000",
                500: "#00B800",
                700: "#008A00",
                900: "#003D00",
              },
              failure: {
                900: "#3D0000",
                700: "#7A0000",
                500: "#CC0000",
                300: "#FF3333",
                200: "#FF9999",
              },
              warning: {
                900: "#4A3D00",
                700: "#7A6500",
                500: "#FFE600",
                200: "#FFF6A3",
              },
              primary: {
                900: "#002D00",
                700: "#005C00",
                500: "#008F00",
                300: "#00C800",
                200: "#80FF80",
              },
              foreground: "black",
              fastm: {
                text: "black",
                holder: "#00B800",
                background: "#00FF00",
              },
            },
          },
        },
      ],
    }),
  ],
};
