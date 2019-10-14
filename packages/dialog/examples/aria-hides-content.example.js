import React from "react";
import "../styles.css";
import { action } from "@storybook/addon-actions";
import { Dialog } from "../src/index";

export let name = "Aria Hides Content";

export let Example = () => {
  const [showDialog, setShowDialog] = React.useState(false);
  React.useEffect(() => {
    let logMutation = action("Root Node Attribute Mutated");
    let observer = new MutationObserver(mutationsList => {
      for (var mutation of mutationsList) {
        logMutation(
          mutation.attributeName +
            ": " +
            mutation.target.getAttribute("aria-hidden")
        );
      }
    });
    observer.observe(document.getElementById("root"), { attributes: true });
    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog isOpen={showDialog} onDismiss={() => setShowDialog(false)}>
        <p>
          The root node should have aria-hidden="true" set when opened and unset
          when closed.
        </p>
      </Dialog>
    </div>
  );
};
