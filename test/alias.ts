import { reactVersion } from "./env";

let alias: Record<string, string> = {};

if (reactVersion === 16) {
	alias = {
		react: "react-16",
		"react-dom": "react-dom-16",
		"react-is": "react-is-16",
	};
} else if (reactVersion === 18) {
	alias = {
		react: "react-18",
		"react-dom": "react-dom-18",
		"react-is": "react-is-18",
		"@testing-library/react": "@testing-library/react-13",
	};
}

export { alias };
