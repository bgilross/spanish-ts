import plugin from "tailwindcss/plugin"
import type { Config } from "tailwindcss"

// const ultraViolet = "#52489c"
const wisteria = "#8E3BFF"
const trueBlue = "#4062bb"
// const sunset = "#f0c987"
// const champagne = "#F8E7C9"
const darkChampagne = "#edb553"
// const persianRed = "#c3423f"
const lightCoral = "#DD9492"
const cornellRed = "#b3001b"
const vistaBlue = "#95A8DB"

const spanishRed = "#AA151B"
const spanishBlue = "#0039F0"
const spanishWhite = "#CCCCCC"
const spanishYellow = "#F1BF00"

const config: Config = {
	content: [
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				primary: spanishRed,
				primary_light: lightCoral,
				primary_med: cornellRed,
				secondary: spanishYellow,
				secondary_light: "#F9E599",
				secondary_dark: darkChampagne,
				accent: spanishWhite,
				accent_light: wisteria,
				true_blue: trueBlue,
				blue_light: vistaBlue,
				cornell: cornellRed,
				spanishBlue,
				spanishWhite,
			},
		},
	},
	plugins: [
		plugin(({ addBase, theme }) => {
			const colorTheme = theme("colors") as Record<string, string>
			const cssVariables: Record<string, string> = {}

			for (const [key, value] of Object.entries(colorTheme)) {
				if (typeof value === "string") {
					cssVariables[`--${key}`] = value
				}
			}

			addBase({ ":root": cssVariables })
		}),
	],
}

export default config
