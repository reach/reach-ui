import * as React from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

let name = "With render props";

function Example() {
  return (
    <Tabs keyboardActivation="manual">
      {({ selectedIndex, focusedIndex }) => {
        let getTabStyle = (index) => ({
          borderBottom: `4px solid ${
            selectedIndex === index
              ? "red"
              : focusedIndex === index
              ? "blue"
              : "black"
          }`,
        });
        return (
          <React.Fragment>
            <TabList>
              <Tab style={getTabStyle(0)}>Uno</Tab>
              <Tab style={getTabStyle(1)}>Dos</Tab>
              <Tab style={getTabStyle(2)}>Tres</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>Uno</TabPanel>
              <TabPanel>Dos</TabPanel>
              <TabPanel>Tres</TabPanel>
            </TabPanels>
          </React.Fragment>
        );
      }}
    </Tabs>
  );
}

Example.storyName = name;
export { Example };
