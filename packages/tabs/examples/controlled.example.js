import React, { useState } from "react";
import "../styles.css";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "../src";

export const name = "Controlled";

const tabsStyle = {
  width: 400,
  boxShadow: "1px 1px 5px hsla(0, 0%, 0%, 0.25)",
  borderRadius: "0.8rem",
  overflow: "hidden"
};

export function Example() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <div>
      <p>Control the tabs with this slider:</p>

      <p>
        <input
          type="range"
          min="0"
          max="2"
          value={tabIndex}
          onChange={event => {
            setTabIndex(parseInt(event.target.value, 10));
          }}
        />{" "}
        {tabIndex}
      </p>

      <Tabs
        index={tabIndex}
        style={tabsStyle}
        onChange={index => {
          setTabIndex(index);
        }}
      >
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanels style={{ padding: 10 }}>
          <TabPanel>
            <p>Click the tabs and then click the back/forward buttons</p>
          </TabPanel>
          <TabPanel>
            <p>Yeah yeah. What's up?</p>
          </TabPanel>
          <TabPanel>
            <p>Oh, hello there.</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
