import * as React from "react";
import { render, cleanup, userEvent } from "@reach-internal/test/utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFocusChange } from "@reach/utils";

afterEach(cleanup);

describe("useFocusChange", () => {
	const Test = ({
		onChange,
		when,
	}: {
		onChange: () => void;
		when?: "focus" | "blur";
	}) => {
		useFocusChange(onChange, when);
		return (
			<>
				<input type="text" placeholder="first" />
				<input type="text" placeholder="second" />
				<div>just div</div>
			</>
		);
	};

	const renderTest = (when?: "focus" | "blur") => {
		const handleChange = vi.fn();
		const { getByPlaceholderText, getByText } = render(
			<Test onChange={handleChange} when={when} />
		);
		const firstInput = getByPlaceholderText("first");
		const secondInput = getByPlaceholderText("second");
		const div = getByText("just div");
		return {
			firstInput,
			secondInput,
			div,
			handleChange,
		};
	};

	/**
	 * WARNING: The order of the tests is important:
	 * the blur test should come first.
	 * If this is not the case, the activeElement will be dirty
	 * and the blur event will fire when the input is clicked.
	 */

	it("should call handler on blur", async () => {
		const {
			firstInput,
			secondInput,
			div,
			handleChange: handleBlur,
		} = renderTest("blur");

		await userEvent.click(firstInput);
		expect(handleBlur).not.toHaveBeenCalled();

		await userEvent.click(secondInput);
		expect(handleBlur).toHaveBeenCalledTimes(1);
		expect(handleBlur).toHaveBeenCalledWith(
			document.body,
			document.body,
			expect.any(FocusEvent)
		);

		await userEvent.click(div);
		expect(handleBlur).toHaveBeenCalledTimes(2);
		expect(handleBlur).toHaveBeenCalledWith(
			document.body,
			document.body,
			expect.any(FocusEvent)
		);
	});

	it("should call handler on focus", async () => {
		const { firstInput, secondInput, handleChange: handleFocus } = renderTest();

		await userEvent.click(firstInput);
		expect(handleFocus).toHaveBeenCalledTimes(1);
		expect(handleFocus).toHaveBeenCalledWith(
			firstInput,
			document.body,
			expect.any(FocusEvent)
		);

		await userEvent.click(secondInput);
		expect(handleFocus).toHaveBeenCalledTimes(2);
		expect(handleFocus).toHaveBeenCalledWith(
			secondInput,
			firstInput,
			expect.any(FocusEvent)
		);
	});

	it("should do not call handler on focus at the same node", async () => {
		const { firstInput, handleChange: handleFocus } = renderTest();

		await userEvent.click(firstInput);
		expect(handleFocus).toHaveBeenCalledOnce();

		await userEvent.click(firstInput);
		expect(handleFocus).toHaveBeenCalledOnce();
	});
});
