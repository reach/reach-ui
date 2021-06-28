import * as React from "react";
import { act, render } from "$test/utils";
import { AxeResults } from "$test/types";
import { axe } from "jest-axe";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";

describe("<Tabs /> with axe", () => {
  it("Should not have ARIA violations", async () => {
    jest.useRealTimers();
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

    let results: AxeResults = null as any;
    await act(async () => {
      results = await axe(container);
    });
    expect(results).toHaveNoViolations();
  });
});
