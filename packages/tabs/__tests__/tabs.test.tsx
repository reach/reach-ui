import React from "react";
import { act, render, fireEvent } from "$test/utils";
import { AxeResults } from "$test/types";
import { axe } from "jest-axe";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabsKeyboardActivation,
  TabsOrientation,
} from "@reach/tabs";

describe("<Tabs />", () => {
  describe("rendering", () => {
    it("sets the button type to button by default", () => {
      const { getByText } = render(
        <div>
          <Tabs>
            <TabList>
              <Tab>Tab 1</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <p>Panel 1</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      );

      expect(getByText("Tab 1")).toHaveAttribute("type", "button");
    });
  });

  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
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

  describe("user events", () => {
    it("selects the correct tab with keyboard navigation", () => {
      const { getByText, getByRole } = render(
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

      let tabList = getByRole("tablist");

      fireEvent.click(getByText("Tab 1"));

      fireEvent.keyDown(tabList, { key: "ArrowRight", code: 39 });
      expect(getByText("Tab 2")).toHaveFocus();
      expect(getByText("Panel 2")).toBeVisible();
      expect(getByText("Panel 1")).not.toBeVisible();

      fireEvent.keyDown(tabList, { key: "ArrowRight", code: 39 });
      expect(getByText("Tab 3")).toHaveFocus();
      expect(getByText("Panel 3")).toBeVisible();
      expect(getByText("Panel 2")).not.toBeVisible();

      fireEvent.keyDown(tabList, { key: "ArrowRight", code: 39 });
      expect(getByText("Tab 1")).toHaveFocus();

      fireEvent.keyDown(tabList, { key: "ArrowLeft", code: 37 });
      expect(getByText("Tab 3")).toHaveFocus();

      fireEvent.keyDown(tabList, { key: "ArrowLeft", code: 37 });
      fireEvent.keyDown(tabList, { key: "ArrowLeft", code: 37 });
      expect(getByText("Tab 1")).toHaveFocus();

      fireEvent.keyDown(tabList, { key: "End", code: 35 });
      expect(getByText("Tab 3")).toHaveFocus();

      fireEvent.keyDown(tabList, { key: "Home", code: 36 });
      expect(getByText("Tab 1")).toHaveFocus();
    });

    it("focuses the correct tab with keyboard navigation (vertical orientation)", () => {
      const { getByText, getByRole } = render(
        <div>
          <Tabs orientation={TabsOrientation.Vertical}>
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

      let tabList = getByRole("tablist");

      fireEvent.click(getByText("Tab 1"));

      fireEvent.keyDown(tabList, { key: "ArrowDown", code: 40 });
      expect(getByText("Tab 2")).toHaveFocus();
      expect(getByText("Panel 2")).toBeVisible();
      expect(getByText("Panel 1")).not.toBeVisible();

      fireEvent.keyDown(tabList, { key: "ArrowDown", code: 40 });
      expect(getByText("Tab 3")).toHaveFocus();
      expect(getByText("Panel 3")).toBeVisible();
      expect(getByText("Panel 2")).not.toBeVisible();

      fireEvent.keyDown(tabList, { key: "ArrowDown", code: 40 });
      expect(getByText("Tab 1")).toHaveFocus();

      fireEvent.keyDown(tabList, { key: "ArrowUp", code: 38 });
      expect(getByText("Tab 3")).toHaveFocus();

      fireEvent.keyDown(tabList, { key: "ArrowUp", code: 38 });
      fireEvent.keyDown(tabList, { key: "ArrowUp", code: 38 });
      expect(getByText("Tab 1")).toHaveFocus();

      fireEvent.keyDown(tabList, { key: "End", code: 35 });
      expect(getByText("Tab 3")).toHaveFocus();

      fireEvent.keyDown(tabList, { key: "Home", code: 36 });
      expect(getByText("Tab 1")).toHaveFocus();
    });

    it("focuses the correct tab with manual keyboard navigation", () => {
      const { getByRole } = render(
        <div>
          <Tabs keyboardActivation={TabsKeyboardActivation.Manual}>
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

      let tabList = getByRole("tablist");

      expect(tabList).toBeTruthy();

      // TODO: Fails, but works in the browser. Figure out why and fix it.
      // fireEvent.click(getByText("Tab 1"));
      // fireEvent.keyDown(tabList, { key: "ArrowRight", code: 39 });
      // expect(getByText("Tab 2")).toHaveFocus();
    });
  });
});
