/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#fafafa",
        pure: "#ffffff",
        hairline: "#ebebeb",
        ash: "#c9c9c9",
        smoke: "#a8a8a8",
        graphite: "#8f8f8f",
        slate: "#7d7d7d",
        stone: "#666666",
        charcoal: "#4d4d4d",
        obsidian: "#171717",
        carbon: "#000000",
        terminal: {
          green: "#297a3a",
          bg: "#fafafa",
        }
      },
      fontFamily: {
        sans: ["Geist Sans", "Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        'sm': '2px',
        'md': '6px',
        'lg': '6px',
        'full': '9999px',
      },
      boxShadow: {
        'subtle': 'rgba(0, 0, 0, 0.08) 0px 0px 0px 1px, rgb(250, 250, 250) 0px 0px 0px 1px',
        'subtle-2': 'rgb(235, 235, 235) 0px 0px 0px 1px',
        'hairline': '0 0 0 1px #ebebeb',
      },
      letterSpacing: {
        'tightest': '-0.06em',
        'tight-heading': '-1.5px',
        'display': '-3.84px',
        'eyebrow': '0.071em',
      }
    },
  },
  plugins: [],
}
