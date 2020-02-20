import React from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

let name = "Vertically oriented tabs (TS)";

function Example() {
  return (
    <div>
      <Tabs orientation="vertical">
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>

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
      </Tabs>
      <div style={{ marginTop: 800 }}>
        <p>Yo!</p>
      </div>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Tabs" };
