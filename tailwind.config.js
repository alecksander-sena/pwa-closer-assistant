// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          50: '#f6fbff',
          100: '#e9f5ff',
          500: '#0ea5e9',
          700: '#0369a1'
        }
      },
      boxShadow: {
        'neon-lg': '0 10px 30px -10px rgba(99,102,241,0.25), 0 6px 20px rgba(29,78,216,0.12)'
      }
    },
  },
  plugins: [],
}
