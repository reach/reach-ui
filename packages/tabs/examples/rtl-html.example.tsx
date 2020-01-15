import React, { useLayoutEffect, useRef } from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";

export const name = "RTL with HTML dir attribute (TS)";

export function Example() {
  let ref = useRef<HTMLDivElement | null>(null);
  let rootDir = useRef<any>();
  useLayoutEffect(() => {
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
