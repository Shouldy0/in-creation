import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0a", // Dark neutral background
                foreground: "#ededed", // Off-white text
                paper: "#171717",      // Slightly lighter background for cards/sections
                ink: "#262626",        // Darker element background
                graphite: "#525252",   // Muted text/borders
                stone: "#a3a3a3",      // Secondary text
                accent: "#e5e5e5",     // High contrast accent
                // Creative State Colors (Muted/Pastel/Dusty)
                state: {
                    idea: "#fde047",     // Yellow-ish
                    blocked: "#f87171",  // Red-ish
                    flow: "#4ade80",     // Green-ish
                    revision: "#60a5fa", // Blue-ish
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                serif: ['var(--font-fraunces)', 'serif'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
