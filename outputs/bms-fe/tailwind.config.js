/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      colors: {
        // Logo Brand Green: #14AE5C
        brand: {
          50: '#edfbf3',
          100: '#d5f7e2',
          200: '#aeefc9',
          300: '#78e2a8',
          400: '#3ecb82',
          500: '#14ae5c', // Exact Logo Green!
          600: '#0b8d48',
          700: '#0b6f3a',
          800: '#0d5830',
          900: '#0d482a',
          950: '#032815',
        },
        // Align emerald palette to exact logo green #14AE5C
        emerald: {
          50: '#edfbf3',
          100: '#d5f7e2',
          200: '#aeefc9',
          300: '#78e2a8',
          400: '#3ecb82',
          500: '#14ae5c', // Exact Logo Green!
          600: '#0b8d48',
          700: '#0b6f3a',
          800: '#0d5830',
          900: '#0d482a',
          950: '#032815',
        },
        // Sleek dark charcoal tones rooted in logo rect #1E1E1E
        slate: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#333333',
          750: '#282828',
          800: '#222222',
          850: '#1e1e1e', // Exact Logo Background #1E1E1E
          900: '#161616',
          950: '#0f0f0f',
        },
      },
    },
  },
  plugins: [],
};
