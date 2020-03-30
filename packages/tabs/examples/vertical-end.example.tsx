import React from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabsOrientation,
} from "@reach/tabs";
import "@reach/tabs/styles.css";

let name = "Vertical-end oriented tabs (TS)";

function Example() {
  return (
    <div>
      <Tabs orientation={TabsOrientation.Vertical}>
        <TabPanels>
          <TabPanel>
            <h1>one!</h1>
            <p>Here's some example content.</p>
            <button>yo</button>
          </TabPanel>
          <TabPanel>
            <h1>two!</h1>
            <p>Here's some example content.</p>
          </TabPanel>
          <TabPanel>
            <h1>three!</h1>
            <p>Here's some example content.</p>
          </TabPanel>
        </TabPanels>
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
      </Tabs>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Tabs" };
