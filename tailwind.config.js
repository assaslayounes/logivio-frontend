/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Cairo", "IBM Plex Sans Arabic", "sans-serif"],
      },
      colors: {
        ink: "#0F172A",
        canvas: "#F7F5F0",
        surface: "#FFFFFF",
        border: "#E4E0D6",
        brand: {
          DEFAULT: "#0F3D3E",
          light: "#155E5F",
          soft: "#E4EEEE",
        },
        amber: {
          DEFAULT: "#C2410C",
          soft: "#FCE9DD",
        },
        success: {
          DEFAULT: "#15803D",
          soft: "#E1F3E7",
        },
        danger: {
          DEFAULT: "#B91C1C",
          soft: "#FBE7E7",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
