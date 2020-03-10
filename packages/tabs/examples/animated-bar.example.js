import React, {
  useState,
  useRef,
  useContext,
  useLayoutEffect,
  createContext,
} from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import { useRect } from "@reach/rect";
import "@reach/tabs/styles.css";

let name = "Animated Bar";

let HORIZONTAL_PADDING = 8;

function Example() {
  return (
    <ExampleAnimatedTabs color="red" style={{ width: 400 }}>
      <TabList style={{ justifyContent: "space-around" }}>
        <ExampleAnimatedTab style={{ flex: 1 }}>The First</ExampleAnimatedTab>
        <ExampleAnimatedTab style={{ flex: 2 }}>
          This has longer text
        </ExampleAnimatedTab>
        <ExampleAnimatedTab style={{ flex: 1 }}>Three</ExampleAnimatedTab>
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
    </ExampleAnimatedTabs>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Tabs" };

////////////////////////////////////////////////////////////////////////////////

const AnimatedContext = createContext();

function ExampleAnimatedTabs({ color, ...rest }) {
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
          // subtract both sides of horizontal padding to center the div
          width: activeRect && activeRect.width - HORIZONTAL_PADDING * 2,
          top: activeRect && activeRect.bottom - 2,
        }}
      />
    </AnimatedContext.Provider>
  );
}

function ExampleAnimatedTab(props) {
  const { isSelected } = props;

  // measure the size of our element, only listen to rect if active
  const ref = useRef();
  const rect = useRect(ref, isSelected);

  // get the style changing function from context
  const setActiveRect = useContext(AnimatedContext);

  // callup to set styles whenever we're active
  useLayoutEffect(() => {
    if (isSelected) {
      setActiveRect(rect);
    }
  }, [isSelected, rect, setActiveRect]);

  return (
    <Tab
      ref={ref}
      {...props}
      style={{
        ...props.style,
        border: "none",
        padding: `4px ${HORIZONTAL_PADDING}px`,
      }}
    />
  );
}
