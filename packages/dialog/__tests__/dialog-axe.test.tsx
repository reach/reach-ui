/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import * as React from "react";
import { axe } from "vitest-axe";
import type { AxeCore } from "vitest-axe";
import { cleanup, render, act } from "@reach-internal/test/utils";
import { Dialog } from "@reach/dialog";
import { expect, describe, afterEach, it, vi } from "vitest";

afterEach(cleanup);

describe("<Dialog /> with axe", () => {
	it("Should not have ARIA violations", async () => {
		vi.useRealTimers();
		const { container } = render(<BasicOpenDialog />);
		let results: AxeCore.AxeResults = null as any;
		await act(async () => {
			results = await axe(container);
		});
		expect(results).toHaveNoViolations();
	});
});

function BasicOpenDialog() {
	const [showDialog, setShowDialog] = React.useState(true);
	return (
		<div>
			<button onClick={() => setShowDialog(true)}>Show Dialog</button>
			<Dialog
				aria-label="Announcement"
				isOpen={showDialog}
				onDismiss={() => setShowDialog(false)}
			>
				<div data-testid="inner">
					<button onClick={() => setShowDialog(false)}>Close Dialog</button>
					<input data-testid="text" type="text" />
					<button data-testid="useless-button">Ayyyyyy</button>
				</div>
			</Dialog>
		</div>
	);
}
