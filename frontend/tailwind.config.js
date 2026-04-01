/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          medium: '#334155',
        },
        blue: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          glow: 'rgba(59,130,246,0.3)',
        },
        green: {
          DEFAULT: '#22c55e',
          dark: '#16a34a',
          glow: 'rgba(34,197,94,0.2)',
        },
        red: {
          DEFAULT: '#ef4444',
          dark: '#dc2626',
          glow: 'rgba(239,68,68,0.2)',
        },
      },
      borderRadius: {
        card: '12px',
        'card-lg': '16px',
      },
    },
  },
  plugins: [],
}
