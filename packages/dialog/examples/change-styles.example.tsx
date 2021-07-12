import * as React from "react";
import { useTransition, animated, config } from "@react-spring/web";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "Change Styles (TS)";

let AnimatedDialogOverlay = animated(DialogOverlay);
let AnimatedDialogContent = animated(DialogContent);

function Example() {
  const [showDialog, setShowDialog] = React.useState(false);
  const transitions = useTransition<boolean, { opacity: number; y: number }>(
    showDialog,
    {
      from: { opacity: 0, y: -10 },
      enter: { opacity: 1, y: 0 },
      leave: { opacity: 0, y: 10 },
      config: config.stiff,
    }
  );
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
                    (value: any) => `translate3d(0px, ${value}px, 0px)`
                  ),
                  border: "4px solid hsla(0, 0%, 0%, 0.5)",
                  borderRadius: 10,
                }}
              >
                <button onClick={() => setShowDialog(false)}>
                  Close Dialog
                </button>
                <h2 id="dialog-title">Animation is fun!</h2>
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
