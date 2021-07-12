import * as React from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

let name = "Wrappers Gone Wild (TS)";

function Example() {
  return (
    <div>
      <Tabs defaultIndex={1}>
        <TabList>
          <Tab>One</Tab>
          <div style={{ display: "flex" }}>
            <GroupedTabs />
          </div>
          <Tab>Four</Tab>
        </TabList>
        <div>
          <GroupedPanels />
        </div>
      </Tabs>
    </div>
  );
}

function GroupedPanels() {
  return (
    <div>
      <div>
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
            <div>
              <TabPanel>
                <h1>four!</h1>
              </TabPanel>
            </div>
          </div>
        </TabPanels>
      </div>
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

Example.storyName = name;
export { Example };
