import * as React from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabsOrientation,
} from "@reach/tabs";
import "@reach/tabs/styles.css";

let name = "Vertically oriented tabs, RTL (TS)";

function Example() {
  return (
    <div style={{ direction: "rtl" }}>
      <Tabs orientation={TabsOrientation.Vertical}>
        <TabList>
          <Tab>First tab</Tab>
          <Tab>Second tab</Tab>
          <Tab>Third tab</Tab>
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

Example.storyName = name;
export { Example };
