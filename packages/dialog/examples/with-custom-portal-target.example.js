import * as React from "react";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "With Custom Portal Target";

function Example() {
  const [showDialog, setShowDialog] = React.useState(false);
  const containerRef = React.useRef();
  return (
    <div ref={containerRef}>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <DialogOverlay
        aria-label="Announcement"
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
        containerRef={containerRef}
      >
        <DialogContent aria-labelledby="Announcement">
          <p>This Dialog will be rendered within a custom DOM Node.</p>
        </DialogContent>
      </DialogOverlay>
    </div>
  );
}

Example.storyName = name;
export { Example };
