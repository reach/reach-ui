/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import * as React from "react";
import {
	cleanup,
	render,
	fireEvent,
	act,
	screen,
} from "@reach-internal/test/utils";
import { Tooltip, LEAVE_TIMEOUT, MOUSE_REST_TIMEOUT } from "@reach/tooltip";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

describe("<Tooltip />", () => {
	describe("rendering", () => {
		it("renders as any HTML element", () => {
			vi.useFakeTimers();

			let tooltipText = "Look at me";
			let { getByText } = render(
				<p>
					<Tooltip as="span" style={{ display: "block" }} label={tooltipText}>
						<span>Trigger</span>
					</Tooltip>
				</p>
			);

			let trigger = getByText("Trigger");
			act(() => {
				fireEvent.mouseOver(trigger);
				vi.advanceTimersByTime(MOUSE_REST_TIMEOUT);
			});

			let tooltip = getByText(tooltipText);
			expect(tooltip.tagName).toBe("SPAN");

			act(() => void leaveTooltip(trigger));
			vi.useRealTimers();
		});
	});

	describe("user events", () => {
		it("shows/hides on hover", () => {
			vi.useFakeTimers();
			let tooltipText = "Look at me";

			let { getByText, queryByText } = render(
				<Tooltip label={tooltipText}>
					<button>Trigger</button>
				</Tooltip>
			);

			let trigger = getByText("Trigger");
			expect(queryByText(tooltipText)).toBeFalsy();

			act(() => {
				fireEvent.mouseOver(trigger);
				vi.advanceTimersByTime(MOUSE_REST_TIMEOUT);
			});

			expect(queryByText(tooltipText)).toBeTruthy();

			act(() => void leaveTooltip(trigger));

			expect(queryByText(tooltipText)).toBeFalsy();

			vi.useRealTimers();
		});

		it("shows/hides when trigger is focused/blurred", () => {
			vi.useFakeTimers();
			let tooltipText = "Look at me";
			let { getByText, queryByText } = render(
				<Tooltip label={tooltipText}>
					<button>Trigger</button>
				</Tooltip>
			);

			let trigger = getByText("Trigger");
			expect(queryByText(tooltipText)).toBeFalsy();

			act(() => void fireEvent.focus(trigger));
			expect(queryByText(tooltipText)).toBeTruthy();

			act(() => void blurTooltip(trigger));
			expect(queryByText(tooltipText)).toBeFalsy();

			vi.useRealTimers();
		});

		it("shows without timeout when one tooltip is already visible", () => {
			vi.useFakeTimers();
			let { getByText } = render(
				<>
					<Tooltip label="First">
						<button>First Trigger</button>
					</Tooltip>
					<Tooltip label="Second">
						<button>Second Trigger</button>
					</Tooltip>
				</>
			);

			let firstTrigger = getByText("First Trigger");
			let secondTrigger = getByText("Second Trigger");

			act(() => {
				fireEvent.mouseOver(firstTrigger);
				vi.advanceTimersByTime(MOUSE_REST_TIMEOUT);
			});

			expect(screen.queryByText("First Trigger")).toBeTruthy();

			act(() => {
				fireEvent.mouseLeave(firstTrigger);
				fireEvent.mouseOver(secondTrigger);
			});

			expect(screen.queryByText("Second Trigger")).toBeTruthy();

			act(() => void leaveTooltip(secondTrigger));
			vi.useRealTimers();
		});

		it("hides on ESC", () => {
			vi.useFakeTimers();
			let tooltipText = "Look at me";
			let { getByText, queryByText } = render(
				<Tooltip label={tooltipText}>
					<button>Trigger</button>
				</Tooltip>
			);

			let trigger = getByText("Trigger");

			act(() => {
				fireEvent.focus(trigger);
				vi.advanceTimersByTime(MOUSE_REST_TIMEOUT);
			});
			expect(queryByText(tooltipText)).toBeTruthy();

			act(() => void fireEvent.keyDown(trigger, { key: "Escape" }));
			expect(queryByText(tooltipText)).toBeFalsy();

			act(() => void leaveTooltip(trigger));
			vi.useRealTimers();
		});
	});
});

function leaveTooltip(element: HTMLElement) {
	fireEvent.mouseLeave(element);
	vi.advanceTimersByTime(LEAVE_TIMEOUT);
}

function blurTooltip(element: HTMLElement) {
	fireEvent.blur(element);
	vi.advanceTimersByTime(LEAVE_TIMEOUT);
}
