import React, {
  useState,
  useRef,
  useContext,
  useLayoutEffect,
  createContext
} from "react";
import "../styles.css";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "../src";
import { useRect } from "../../rect/src";
import { AutoIdProvider } from "@reach/auto-id";

export const name = "Animated Bar";

const AnimatedContext = createContext();

function AnimatedTabs({ color, ...rest }) {
  // some state to store the position we want to animate to
  const [activeRect, setActiveRect] = useState(null);

  return (
    // put the function to change the styles on context so an active Tab
    // can call it, then style it up
    <AnimatedContext.Provider value={setActiveRect}>
      {/* make sure to forward props since we're wrapping Tabs */}
      <Tabs {...rest} style={{ ...rest.style, position: "relative" }} />
      <div
        style={{
          position: "absolute",
          height: 2,
          background: color,
          transition: "all 300ms ease",
          left: activeRect && activeRect.left,
          width: activeRect && activeRect.width,
          top: activeRect && activeRect.bottom - 2
        }}
      />
    </AnimatedContext.Provider>
  );
}

function AnimatedTab(props) {
  // yeargh! this is private API, oh well!
  const { isActive } = props;

  // measure the size of our element, only listen to rect if active
  const ref = useRef();
  const rect = useRect(ref, isActive);

  // get the style changing function from context
  const setActiveRect = useContext(AnimatedContext);

  // callup to set styles whenever we're active
  useLayoutEffect(() => {
    if (isActive) {
      setActiveRect(rect);
    }
  }, [isActive, rect]);

  return (
    <Tab ref={ref} {...props} style={{ ...props.style, border: "none" }} />
  );
}

export function Example() {
  return (
    <AutoIdProvider>
      <AnimatedTabs color="red" style={{ width: 400 }}>
        <TabList style={{ justifyContent: "space-around" }}>
          <AnimatedTab style={{ flex: 1 }}>The First</AnimatedTab>
          <AnimatedTab style={{ flex: 2 }}>This has longer text</AnimatedTab>
          <AnimatedTab style={{ flex: 1 }}>Three</AnimatedTab>
        </TabList>
        <TabPanels style={{ padding: 10 }}>
          <TabPanel>
            <p>Check it out! It's ~animated~</p>
          </TabPanel>
          <TabPanel>
            <p>Yeah yeah. What's up?</p>
          </TabPanel>
          <TabPanel>
            <p>Oh, hello there.</p>
          </TabPanel>
        </TabPanels>
      </AnimatedTabs>
    </AutoIdProvider>
  );
}
