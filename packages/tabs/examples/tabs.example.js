import React from "react";
import { Tabs, TabBar, Tab, TabPanels } from "../src/index";

// The name of the example, you must export it as `name`
export let name = "Tabs";

// The example to render, you must name it `Example`
export let Example = () => (
  <Tabs>
    <TabBar>
      <Tab>One</Tab>
      <Tab id="two-tab">Two</Tab>
      <Tab id="three-tab">Three</Tab>
    </TabBar>
    <TabPanels>
      <div id="one-panel">Oneco</div>
      <div id="two-panel">Twoco</div>
      <div id="three-panel">Treco </div>
    </TabPanels>
  </Tabs>
);
