import React from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

export const name = "Disabled Tabs";

const tabsStyle = {
  width: 400,
  boxShadow: "1px 1px 5px hsla(0, 0%, 0%, 0.25)"
};

export function Example() {
  return (
    <Tabs style={tabsStyle}>
      <TabList>
        <Tab disabled>One</Tab>
        <Tab>Two</Tab>
        <Tab>Three</Tab>
      </TabList>
      <TabPanels style={{ padding: 10 }}>
        <TabPanel>
          <p>This shouldn't ever render</p>
        </TabPanel>
        <TabPanel>
          <p>This tab is fine</p>
        </TabPanel>
        <TabPanel>
          <p>This one is good too</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
