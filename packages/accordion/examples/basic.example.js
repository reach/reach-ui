import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";
import { action } from "@storybook/addon-actions";
import "@reach/accordion/styles.css";

let name = "Basic";

function Example() {
  return (
    <Accordion defaultIndex={2} onChange={action(`Selecting panel`)}>
      <AccordionItem>
        <h3>
          <AccordionButton>You can activate me</AccordionButton>
        </h3>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem disabled>
        <h3>
          <AccordionButton>You can't touch me</AccordionButton>
        </h3>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h3>
          <AccordionButton>You can definitely activate me</AccordionButton>
        </h3>
        <AccordionPanel>
          <ExampleForm />
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

const initialFormState = {
  name: "",
  email: "",
  comments: "",
};

function ExampleForm() {
  const [state, dispatch] = React.useReducer(
    (state, { fieldName, value }) => ({
      ...state,
      [fieldName]: value,
    }),
    initialFormState
  );
  const handlers = Object.keys(initialFormState).reduce((acc, fieldName) => {
    acc[fieldName] = ({ currentTarget: { value } }) =>
      dispatch({ fieldName, value });
    return acc;
  }, {});
  const inputStyle = {
    display: "block",
    width: `100%`,
    border: `1px solid #c5c5c5`,
    padding: `0.5rem 0.6rem`,
  };
  const labelStyle = {
    display: "block",
    width: `calc(100% - 4rem)`,
    margin: `2rem 2rem`,
  };
  return (
    <form
      style={{
        display: "block",
        border: `1px solid #c5c5c5`,
        margin: `1rem 0`,
      }}
    >
      <label style={labelStyle}>
        Name
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handlers.name}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Email
        <input
          type="email"
          name="email"
          value={state.email}
          onChange={handlers.email}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Comments
        <textarea
          name="comments"
          value={state.comments}
          onChange={handlers.comments}
          style={{ ...inputStyle, height: 100, resize: "none" }}
        />
      </label>
      <button
        onClick={(event) => {
          event.preventDefault();
          window.alert("Great job!");
        }}
        style={{
          display: "inline-block",
          font: "inherit",
          margin: `0 2rem 2rem`,
          padding: "0.8em 1em",
          MozAppearance: "none",
          WebkitAppearance: "none",
          border: "1px solid #c5c5c5",
          background: "hsla(0, 0%, 0%, 0.05)",
        }}
      >
        Submit
      </button>
    </form>
  );
}
