/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Dark/light rejimga moslashuvchi ranglar (qiymatlari src/index.css dagi CSS o'zgaruvchilarda)
      colors: {
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        line: "var(--border)",
        ink: "var(--ink)",
        body: "var(--text)",
        muted: "var(--muted)",
      },
    },
  },
  plugins: [],
}
