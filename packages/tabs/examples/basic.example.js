import React from "react";
import "../styles.css";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "../src";

export const name = "Basic";

export const Example = () => (
  <Tabs>
    <TabList>
      <Tab>One</Tab>
      <Tab>Two</Tab>
      <Tab>Three</Tab>
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
);
