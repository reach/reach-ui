import * as React from "react";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";
import FocusLock from "react-focus-lock";
import Portal from "@reach/portal";

let name = "With customized focus lock";

const FRAME_OVERLAY_STYLES: React.CSSProperties = {
  position: "fixed",
  bottom: "0px",
  top: "0px",
  right: "0px",
  left: "0px",
  zIndex: 100000,
  backgroundColor: "rgba(160, 160, 160, 0.2)",
};

const FRAME_STYLES: React.CSSProperties = {
  display: "block",
  backgroundColor: "white",
  border: "1px solid rgb(172, 172, 172)",
  width: "600px",
  height: "400px",
  margin: "50px auto 0px",
  boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 16px",
};

function FakeInaccessibleFrame({
  id,
  show,
  close,
}: {
  id?: string;
  show: boolean;
  close: () => void;
}) {
  if (!show) return null;
  return (
    <Portal>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div id={id} style={FRAME_OVERLAY_STYLES} onClick={close}>
        <iframe
          title="Wikipedia"
          style={FRAME_STYLES}
          src="https://reach.tech/"
        />
      </div>
    </Portal>
  );
}

function ExampleDialogContent({ openFrame }: { openFrame: () => void }) {
  return (
    <DialogContent aria-label="Announcement">
      <p>Open an dialog-like iframe by clicking the button below.</p>
      <p>
        This dialog will disable its focus lock while the frame is open, to
        allow it to grab focus.
      </p>
      <p>
        Both this dialog and the iframe can be dismissed by clicking in the
        overlay around them.
      </p>
      <button onClick={openFrame}>Show frame</button>
    </DialogContent>
  );
}

function ExampleSelectiveDisablingFocusLock() {
  const [showFrame, setShowFrame] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  return (
    <div>
      <p>
        This is not recommended generally, but sometimes the focus lock is too
        aggressive or not quite tailored to your needs. Approach this with an
        abundance of caution; your app <strong>will not be accessible</strong>{" "}
        without a proper focus lock!
      </p>
      <h3>Disable focus lock selectively while needed</h3>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <DialogOverlay
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
        dangerouslyBypassFocusLock={showFrame}
      >
        <ExampleDialogContent openFrame={() => setShowFrame(true)} />
      </DialogOverlay>
      <FakeInaccessibleFrame
        show={showFrame}
        close={() => setShowFrame(false)}
      />
    </div>
  );
}

function ExampleCustomFocusLock() {
  const [showFrame, setShowFrame] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  return (
    <div>
      <h3>Setup our own focus lock</h3>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <DialogOverlay
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
        dangerouslyBypassFocusLock
      >
        <FocusLock
          whiteList={(node) => {
            const frameRoot = document.getElementById("problematic-frame");
            return !frameRoot || !frameRoot.contains(node);
          }}
        >
          <ExampleDialogContent openFrame={() => setShowFrame(true)} />
        </FocusLock>
      </DialogOverlay>
      <FakeInaccessibleFrame
        id="problematic-frame"
        show={showFrame}
        close={() => setShowFrame(false)}
      />
    </div>
  );
}

function Example() {
  return (
    <>
      <ExampleSelectiveDisablingFocusLock />
      <ExampleCustomFocusLock />
    </>
  );
}

// Assign the name to the example and then export it as a named constant
Example.storyName = name;
export { Example };

// Default export an object with the title matching the name of the Reach package
export default { title: "Dialog" };
