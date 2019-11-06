import React from "react";
// import renderer from "react-test-renderer";
// import { act } from "react-dom/test-utils";
import { render, fireEvent } from "@testing-library/react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "./index";
import "@testing-library/jest-dom/extend-expect";

describe("rendering", () => {
  it("should match the snapshot", () => {
    const { asFragment } = render(<BasicTabs />);
    expect(asFragment()).toMatchSnapshot();
  });
  it("focuses the correct tab with keyboard navigation", () => {
    const { getByText, getByRole, asFragment, container } = render(
      <BasicTabs />
    );
    const firstTab = getByText("Tab One");
    const tabList = getByRole("tablist");

    function getTabPanelByButtonID(buttonId) {
      return container.querySelector(
        `#${container
          .querySelector(`#${buttonId}`)
          .getAttribute("aria-controls")}`
      );
    }

    fireEvent.click(firstTab);

    fireEvent.keyDown(tabList, { key: "ArrowRight", code: 39 });
    expect(document.activeElement).toBe(container.querySelector("#tab-2"));
    expect(getTabPanelByButtonID("tab-2")).toBeVisible();
    expect(getTabPanelByButtonID("tab-1")).not.toBeVisible();
    expect(asFragment()).toMatchSnapshot();

    fireEvent.keyDown(tabList, { key: "ArrowRight", code: 39 });
    expect(document.activeElement).toBe(container.querySelector("#tab-3"));
    expect(getTabPanelByButtonID("tab-3")).toBeVisible();
    expect(getTabPanelByButtonID("tab-2")).not.toBeVisible();

    fireEvent.keyDown(tabList, { key: "ArrowRight", code: 39 });
    expect(document.activeElement).toBe(container.querySelector("#tab-1"));

    fireEvent.keyDown(tabList, { key: "ArrowLeft", code: 37 });
    expect(document.activeElement).toBe(container.querySelector("#tab-3"));

    fireEvent.keyDown(tabList, { key: "ArrowLeft", code: 37 });
    fireEvent.keyDown(tabList, { key: "ArrowLeft", code: 37 });
    expect(document.activeElement).toBe(container.querySelector("#tab-1"));

    fireEvent.keyDown(tabList, { key: "End", code: 35 });
    expect(document.activeElement).toBe(container.querySelector("#tab-3"));

    fireEvent.keyDown(tabList, { key: "Home", code: 36 });
    expect(document.activeElement).toBe(container.querySelector("#tab-1"));
  });
});

////////////////////////////////////////////////////////////////////////////////
function BasicTabs() {
  return (
    <div>
      <Tabs>
        <TabList>
          <Tab id="tab-1">Tab One</Tab>
          <Tab id="tab-2">Tab Two</Tab>
          <Tab id="tab-3">Tab Three</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <h1>one!</h1>
            <button>yo</button>
          </TabPanel>
          <TabPanel>
            <h1>two!</h1>
          </TabPanel>
          <TabPanel>
            <h1>three!</h1>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
