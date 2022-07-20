/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import * as React from "react";
import { cleanup, render, fireEvent, act } from "@reach-internal/test/utils";
import { axe } from "vitest-axe";
import type { AxeCore } from "vitest-axe";
import { Tooltip, LEAVE_TIMEOUT, MOUSE_REST_TIMEOUT } from "@reach/tooltip";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

describe("<Tooltip /> with axe", () => {
	it("Should not have ARIA violations", async () => {
		let { container, getByText } = render(
			<div data-testid="tooltip">
				<Tooltip label="Content">
					<button>Trigger</button>
				</Tooltip>
			</div>
		);

		let trigger = getByText("Trigger");

		// We need to use real timers to stop axe from timing out, then revert
		// back to fake timers to continue our tests.
		vi.useRealTimers();
		let results: AxeCore.AxeResults = null as any;
		await act(async () => {
			results = await axe(container);
		});
		expect(results).toHaveNoViolations();

		vi.useFakeTimers();
		act(() => {
			fireEvent.mouseOver(trigger);
			vi.advanceTimersByTime(MOUSE_REST_TIMEOUT);
		});
		vi.useRealTimers();

		await act(async () => {
			results = await axe(container);
		});
		expect(results).toHaveNoViolations();

		vi.useFakeTimers();
		act(() => void leaveTooltip(trigger));
		vi.useRealTimers();
	});
});

function leaveTooltip(element: HTMLElement) {
	fireEvent.mouseLeave(element);
	vi.advanceTimersByTime(LEAVE_TIMEOUT);
}
