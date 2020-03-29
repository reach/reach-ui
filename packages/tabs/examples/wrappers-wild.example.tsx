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

let name = "Wrappers Gone Wild (TS)";

function Example() {
  return (
    <div>
      <Tabs orientation={TabsOrientation.HorizontalEnd} defaultIndex={1}>
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
          <div>
            <TabPanel>
              <h1>three!</h1>
              <p>Here's some example content.</p>
            </TabPanel>
            <TabPanel>
              <h1>four!</h1>
            </TabPanel>
          </div>
        </TabPanels>
        <TabList>
          <Tab>One</Tab>
          <div style={{ display: "flex" }}>
            <GroupedTabs />
          </div>
          <Tab>Four</Tab>
        </TabList>
      </Tabs>
    </div>
  );
}

function GroupedTabs() {
  return (
    <React.Fragment>
      <Tab>Two</Tab>
      <div>
        <Tab>Three</Tab>
      </div>
    </React.Fragment>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Tabs" };
