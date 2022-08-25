/// <reference types="vitest-dom/extend-expect" />

import * as React from "react";
import { render, cleanup, userEvent } from "@reach-internal/test/utils";
import { afterEach, describe, expect, it } from "vitest";
import { usePrevious } from "@reach/utils";

afterEach(cleanup);

describe.only("usePrevious", () => {
	it("should return previous value", async () => {
		const Test = () => {
			const [state, setState] = React.useState("foo");
			const previousState = usePrevious(state);
			return (
				<>
					<div data-testid="previousState">
						{state}
						{previousState}
					</div>
					<div data-testid="currentState">{state}</div>
					<button data-testid="buttonFoo" onClick={() => setState("foo")} />
					<button data-testid="buttonBar" onClick={() => setState("bar")} />
				</>
			);
		};

		const { getByTestId } = render(<Test />);
		const divCurrentState = getByTestId("currentState");
		const divPreviousState = getByTestId("previousState");
		const buttonFoo = getByTestId("buttonFoo");
		const buttonBar = getByTestId("buttonBar");

		await userEvent.click(buttonBar);
		expect(divCurrentState).toHaveTextContent("bar");
		expect(divPreviousState).toHaveTextContent("foo");

		await userEvent.click(buttonFoo);
		expect(divCurrentState).toHaveTextContent("foo");
		expect(divPreviousState).toHaveTextContent("bar");
	});
});
