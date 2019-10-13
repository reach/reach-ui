import React from "react";
import { useTransition, animated, config } from "react-spring/web.cjs";
import { DialogOverlay, DialogContent } from "../src/index";
import "../styles.css";

export let name = "Change Styles";

let AnimatedDialogOverlay = animated(DialogOverlay);
let AnimatedDialogContent = animated(DialogContent);

export const Example = () => {
  const [showDialog, setShowDialog] = React.useState(false);
  const transitions = useTransition(showDialog, null, {
    from: { opacity: 0, y: -10 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 10 },
    config: config.stiff
  });
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      {transitions.map(
        ({ item, key, props: styles }) =>
          item && (
            <AnimatedDialogOverlay style={{ opacity: styles.opacity }}>
              <AnimatedDialogContent
                style={{
                  transform: `translate3d(0px, ${styles.y}px, 0px)`,
                  border: "4px solid hsla(0, 0%, 0%, 0.5)",
                  borderRadius: 10
                }}
              >
                <button onClick={() => setShowDialog(false)}>
                  Close Dialog
                </button>
                <p>React Spring makes it too easy!</p>
                <input type="text" />
                <br />
                <input type="text" />
                <button>Ayyyyyy</button>
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </div>
  );
};
