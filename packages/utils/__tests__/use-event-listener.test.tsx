import * as React from "react";
import { render, fireEvent, cleanup } from "@reach-internal/test/utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useEventListener } from "@reach/utils";

afterEach(cleanup);

describe("useEventListener", () => {
	const Test = ({ onBodyClick }: { onBodyClick: () => void }) => {
		useEventListener("click", onBodyClick, document.body);
		return null;
	};

	it("should call event listener when it's need", () => {
		const handleBodyClick = vi.fn();
		render(<Test onBodyClick={handleBodyClick} />);
		fireEvent.click(document.body);
		expect(handleBodyClick).toHaveBeenCalledTimes(1);
		fireEvent.click(document.body);
		expect(handleBodyClick).toHaveBeenCalledTimes(2);
	});

	it("should can change event listener from args", () => {
		const handleBodyClick1 = vi.fn();
		const handleBodyClick2 = vi.fn();
		const { rerender } = render(<Test onBodyClick={handleBodyClick1} />);
		fireEvent.click(document.body);
		rerender(<Test onBodyClick={handleBodyClick2} />);
		fireEvent.click(document.body);
		expect(handleBodyClick1).toHaveBeenCalledOnce();
		expect(handleBodyClick2).toHaveBeenCalledOnce();
	});
});
