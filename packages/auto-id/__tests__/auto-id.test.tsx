/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import * as React from "react";
import { render, cleanup } from "@reach-internal/test/utils";
import { vi, it, expect, describe, afterEach } from "vitest";

const { useId } = await vi.importActual<typeof import("../src/reach-auto-id")>(
	"@reach/auto-id"
);

afterEach(cleanup);

describe("useId", () => {
	it("should generate a unique ID value", () => {
		function Comp() {
			let justNull = null;
			let randId = useId(justNull);
			let randId2 = useId();
			return (
				<div>
					<div id={randId}>Wow</div>
					<div id={randId2}>Ok</div>
				</div>
			);
		}

		let { getByText } = render(<Comp />);
		let id1 = Number(getByText("Wow").id);
		let id2 = Number(getByText("Ok").id);
		expect(id2).not.toEqual(id1);
	});
	it("uses a fallback ID", () => {
		function Comp() {
			let newId = useId("awesome");
			return <div id={newId}>Ok</div>;
		}
		let { getByText } = render(<Comp />);
		expect(getByText("Ok").id).toEqual("awesome");
	});
});
