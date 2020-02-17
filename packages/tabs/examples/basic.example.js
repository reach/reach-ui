import React from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import { action } from "@storybook/addon-actions";
import "@reach/tabs/styles.css";

let name = "Basic";

function Example() {
  return (
    <Tabs id="awesome" onChange={action("Change")}>
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
}

Example.story = { name };
export const Comp = Example;
export default { title: "Tabs" };
