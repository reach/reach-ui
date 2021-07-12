import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";
import { action } from "@storybook/addon-actions";
import VisuallyHidden from "@reach/visually-hidden";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import "@reach/accordion/styles.css";
import "@reach/menu-button/styles.css";

let name = "With Arbitrary Elements";

/*
 * Per https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
 *
 * In some accordions, there are additional elements that are always visible
 * adjacent to the accordion header. For instance, a menubutton may accompany
 * each accordion header to provide access to actions that apply to that
 * section. And, in some cases, a snippet of the hidden content may also be
 * visually persistent.
 *
 * TODO: Screen reader testing + verify we aren't violating any aria rules
 */

function Example() {
  return (
    <Accordion defaultIndex={1}>
      <AccordionItem>
        <ExampleAccordionHeader>Option 1</ExampleAccordionHeader>
        <ExampleAccordionBody>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </ExampleAccordionBody>
      </AccordionItem>
      <AccordionItem>
        <ExampleAccordionHeader>Option 2</ExampleAccordionHeader>
        <div style={{ padding: 16 }}>
          This content is not collapsable and not inside the panel. Might be a
          good place for a teaser!
        </div>
        <ExampleAccordionBody>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </ExampleAccordionBody>
      </AccordionItem>
      <AccordionItem>
        <ExampleAccordionHeader>Option 3</ExampleAccordionHeader>
        <ExampleAccordionBody>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </ExampleAccordionBody>
      </AccordionItem>
    </Accordion>
  );
}

Example.storyName = name;
export { Example };

function ExampleAccordionBody({ children }) {
  return <AccordionPanel style={{ padding: 16 }}>{children}</AccordionPanel>;
}

function ExampleAccordionHeader({ children }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "darkslategray",
        border: "4px solid #fff",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        padding: "4px 10px",
      }}
    >
      <h3 style={{ margin: 0, font: "inherit" }}>
        <AccordionButton
          style={{
            appearance: "none",
            background: 0,
            border: 0,
            boxShadow: "none",
            color: "inherit",
            display: "block",
            textAlign: "inherit",
            flexGrow: 1,
            flexShrink: 0,
            font: "inherit",
            fontWeight: "bolder",
            padding: "10px 0",
          }}
        >
          {children}
        </AccordionButton>
      </h3>
      <MyMenuButton style={{ marginLeft: 10 }} />
    </div>
  );
}

function MyMenuButton() {
  return (
    <Menu>
      <MenuButton
        style={{
          background: 0,
          border: 0,
          borderRadius: 50,
          boxShadow: "none",
          display: "block",
          height: 30,
          padding: 6,
          width: 30,
        }}
      >
        <VisuallyHidden>Actions</VisuallyHidden>
        <GearIcon
          style={{
            display: "block",
            fill: "#fff",
            height: "100%",
            width: "100%",
          }}
        />
      </MenuButton>
      <MenuList>
        <MenuItem onSelect={action("Download")}>Download</MenuItem>
        <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
        <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
        <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
      </MenuList>
    </Menu>
  );
}

function GearIcon(props) {
  return (
    <svg {...props} x="0px" y="0px" viewBox="0 0 25 25">
      <path
        d="M24.38,10.175l-2.231-0.268c-0.228-0.851-0.562-1.655-0.992-2.401l1.387-1.763c0.212-0.271,0.188-0.69-0.057-0.934
		l-2.299-2.3c-0.242-0.243-0.662-0.269-0.934-0.057l-1.766,1.389c-0.743-0.43-1.547-0.764-2.396-0.99L14.825,0.62
		C14.784,0.279,14.469,0,14.125,0h-3.252c-0.344,0-0.659,0.279-0.699,0.62L9.906,2.851c-0.85,0.227-1.655,0.562-2.398,0.991
		L5.743,2.455c-0.27-0.212-0.69-0.187-0.933,0.056L2.51,4.812C2.268,5.054,2.243,5.474,2.456,5.746L3.842,7.51
		c-0.43,0.744-0.764,1.549-0.991,2.4l-2.23,0.267C0.28,10.217,0,10.532,0,10.877v3.252c0,0.344,0.279,0.657,0.621,0.699l2.231,0.268
		c0.228,0.848,0.561,1.652,0.991,2.396l-1.386,1.766c-0.211,0.271-0.187,0.69,0.057,0.934l2.296,2.301
		c0.243,0.242,0.663,0.269,0.933,0.057l1.766-1.39c0.744,0.43,1.548,0.765,2.398,0.991l0.268,2.23
		c0.041,0.342,0.355,0.62,0.699,0.62h3.252c0.345,0,0.659-0.278,0.699-0.62l0.268-2.23c0.851-0.228,1.655-0.562,2.398-0.991
		l1.766,1.387c0.271,0.212,0.69,0.187,0.933-0.056l2.299-2.301c0.244-0.242,0.269-0.662,0.056-0.935l-1.388-1.764
		c0.431-0.744,0.764-1.548,0.992-2.397l2.23-0.268C24.721,14.785,25,14.473,25,14.127v-3.252
		C25.001,10.529,24.723,10.216,24.38,10.175z M12.501,18.75c-3.452,0-6.25-2.798-6.25-6.25s2.798-6.25,6.25-6.25
		s6.25,2.798,6.25,6.25S15.954,18.75,12.501,18.75z"
      />
    </svg>
  );
}
