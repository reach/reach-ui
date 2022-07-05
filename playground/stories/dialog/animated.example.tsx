import React from "react";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { animated, useTransition } from "@react-spring/web";
import "@reach/dialog/styles.css";

let name = "Animated";

const AnimatedDialogOverlay = animated(DialogOverlay);
const AnimatedDialogContent = animated(DialogContent);

function Example() {
  const [showDialog, setShowDialog] = React.useState(false);
  const transitions = useTransition(showDialog, {
    from: { opacity: 0, y: -10 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 10 },
  });

  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      {transitions(
        (styles, item) =>
          item && (
            <AnimatedDialogOverlay style={{ opacity: styles.opacity }}>
              <AnimatedDialogContent
                aria-labelledby="dialog-title"
                style={{
                  transform: styles.y.to(
                    (value) => `translate3d(0px, ${value}px, 0px)`
                  ),
                  border: "4px solid hsla(0, 0%, 0%, 0.5)",
                  borderRadius: 10,
                }}
              >
                <button onClick={() => setShowDialog(false)}>
                  Close Dialog
                </button>
                <h2 id="dialog-title">Animated Dialog</h2>
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
}

Example.storyName = name;
export { Example };
