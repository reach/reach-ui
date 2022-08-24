import "vitest-axe/extend-expect";
import "vitest-dom/extend-expect";
import * as axeMatchers from "vitest-axe/matchers";
import * as domMatchers from "vitest-dom/matchers";
import { beforeAll, expect, vi } from "vitest";
import moduleAlias from "module-alias";
import { alias } from "./alias";
import { reactVersion } from "./env";

Object.entries(alias).forEach(([aliasFrom, aliasTo]) => {
	moduleAlias.addAlias(aliasFrom, aliasTo);
});

if (reactVersion === 16) {
	vi.spyOn(globalThis.performance, "mark").mockImplementation(() => ({
		detail: undefined,
		duration: 0,
		entryType: "",
		name: "",
		startTime: 0,
		toJSON: () => "",
	}));
} else if (reactVersion === 18) {
	// @ts-ignore: @see https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment
	globalThis.IS_REACT_ACT_ENVIRONMENT = true;
}

expect.extend(axeMatchers);
expect.extend(domMatchers);

beforeAll(() => {
	vi.mock("@reach/auto-id", () => {
		return {
			useId: (fallback: string) => fallback || "REACH-ID",
		};
	});

	vi.mock("@reach/rect", () => {
		return {
			useRect: () => ({ height: 1, width: 1, x: 0, y: 0 }),
		};
	});
});
