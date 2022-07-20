/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import * as React from "react";
import { cleanup, act, render } from "@reach-internal/test/utils";
import { axe } from "vitest-axe";
import type { AxeCore } from "vitest-axe";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";

import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

describe("<Tabs /> with axe", () => {
	it("Should not have ARIA violations", async () => {
		vi.useRealTimers();
		const { container } = render(
			<div>
				<Tabs>
					<TabList>
						<Tab>Tab 1</Tab>
						<Tab>Tab 2</Tab>
						<Tab>Tab 3</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<p>Panel 1</p>
						</TabPanel>
						<TabPanel>
							<p>Panel 2</p>
						</TabPanel>
						<TabPanel>
							<p>Panel 3</p>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</div>
		);

		let results: AxeCore.AxeResults = null as any;
		await act(async () => {
			results = await axe(container);
		});
		expect(results).toHaveNoViolations();
	});
});
