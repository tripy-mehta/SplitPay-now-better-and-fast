/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#F3F4F6",
        paper: "#0D0E12",
        ledger: {
          50: "#122018",
          100: "#183825",
          400: "#34C759",
          600: "#30B04E",
          900: "#A1F0C0",
        },
        owe: {
          100: "#381616",
          400: "#FF453A",
          600: "#FF5E55",
        },
        brass: "#E5C07B",
        line: "#1F2430",
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
