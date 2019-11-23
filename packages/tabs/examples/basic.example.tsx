import "@reach/tabs/styles.css";

import React from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";

export const name = "Basic (TS)";

export const Example: React.FC = () => (
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
