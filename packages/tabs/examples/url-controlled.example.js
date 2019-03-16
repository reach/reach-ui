import React from "react";
import "../styles.css";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "../src";
import { Router } from "@reach/router";

function App({ tabIndex, navigate }) {
  return (
    <div>
      <h1>Route Controlled Tabs</h1>
      <Tabs
        index={parseInt(tabIndex, 10)}
        style={{ width: 400 }}
        onChange={index => {
          navigate(`/${index}`);
        }}
      >
        <TabList>
          <Tab>One</Tab>
          <Tab>Two</Tab>
          <Tab>Three</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <p>Click the tabs and then click the back/forward buttons</p>
          </TabPanel>
          <TabPanel>
            <p>Yeah yeah. What's up?</p>
          </TabPanel>
          <TabPanel>
            <p>Oh, hello there.</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default () => (
  <Router>
    <App path="/" tabIndex={0} />
    <App path="/:tabIndex" />
  </Router>
);
