/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import * as React from "react";
import { vi, describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@reach-internal/test/utils";
import { axe } from "vitest-axe";
import { VisuallyHidden } from "@reach/visually-hidden";

afterEach(cleanup);

describe("<VisuallyHidden /> with axe", () => {
	it("Should not have ARIA violations", async () => {
		vi.useRealTimers();
		const { container } = render(
			<button onClick={() => void null}>
				<VisuallyHidden>Click Me</VisuallyHidden>
				<span aria-hidden>👏</span>
			</button>
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
