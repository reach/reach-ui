import * as React from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

let name = "RTL with HTML dir attribute (TS)";

function Example() {
  let ref = React.useRef<HTMLDivElement | null>(null);
  let rootDir = React.useRef<any>();
  React.useLayoutEffect(() => {
    let doc = ref.current && ref.current.ownerDocument;
    if (doc) {
      rootDir.current = doc.dir;
      doc.dir = "rtl";
    }
    return () => {
      if (doc) {
        doc.dir = rootDir.current;
      }
    };
  }, []);
  return (
    <Tabs ref={ref}>
      <TabList>
        <Tab>First tab</Tab>
        <Tab>Second tab</Tab>
        <Tab>Third tab</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <h1>one!</h1>
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

Example.storyName = name;
export { Example };
