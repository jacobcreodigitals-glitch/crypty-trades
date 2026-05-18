import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#121212',
        card: '#18181b',
        border: '#27272a',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#eab308',
      },
      boxShadow: {
        glow: '0 20px 70px rgba(34, 197, 94, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
