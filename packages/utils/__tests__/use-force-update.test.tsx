/// <reference types="vitest-dom/extend-expect" />

import * as React from "react";
import { render, cleanup, userEvent } from "@reach-internal/test/utils";
import { afterEach, describe, expect, it } from "vitest";
import { useForceUpdate } from "@reach/utils";

afterEach(cleanup);

describe("useForceUpdate", () => {
	it("should force rerender when called", async () => {
		let nonObservableVariable = "foo";

		const Test = () => {
			const forceUpdate = useForceUpdate();
			return (
				<>
					<div data-testid="div">{nonObservableVariable}</div>
					<button data-testid="button" onClick={forceUpdate} />
				</>
			);
		};

		const { getByTestId } = render(<Test />);
		const div = getByTestId("div");
		const button = getByTestId("button");

		expect(div).toHaveTextContent("foo");
		nonObservableVariable = "bar";
		expect(div).toHaveTextContent("foo");
		await userEvent.click(button);
		expect(div).toHaveTextContent("bar");
	});
});
