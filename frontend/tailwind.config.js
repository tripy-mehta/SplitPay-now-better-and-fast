/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E1116",
        paper: "#F7F6F2",
        ledger: {
          50: "#F2F7F4",
          100: "#DCEFE3",
          400: "#3FA66B",
          600: "#1F7A4D",
          900: "#0F3A26",
        },
        owe: {
          100: "#FCE7E6",
          400: "#E0584C",
          600: "#B83A30",
        },
        brass: "#C9A24B",
        line: "#D8D4CB",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
