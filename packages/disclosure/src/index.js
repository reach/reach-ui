import React from "react";
import Component from "@reach/component-component";
import PropTypes from "prop-types";

const Disclosure = ({ buttonLabel, children }) => (
  <Component getInitialState={() => ({ isExpanded: false })}>
    {({ state, setState }) => (
      <React.Fragment>
        <button
          aria-expanded={state.isExpanded}
          data-reach-disclosure-button
          onClick={() =>
            setState(({ isExpanded }) => ({ isExpanded: !isExpanded }))
          }
        >
          <span aria-hidden={true}>{state.isExpanded ? "▼" : "►"}</span>
          {buttonLabel}
        </button>
        {state.isExpanded && <div>{children}</div>}
      </React.Fragment>
    )}
  </Component>
);

Disclosure.propTypes = {
  buttonLabel: PropTypes.string.isRequired
};

export default Disclosure;
