import * as React from "react";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "Destroy Trigger";

function Example() {
  const openButton = React.useRef(null);
  const startOverButton = React.useRef(null);
  const closeButton = React.useRef(null);
  const [phase, setPhase] = React.useState(1);

  React.useEffect(() => {
    if (phase === 1) {
      openButton.current.focus();
    }
    if (phase === 3) {
      startOverButton.current.focus();
    }
  }, [phase]);

  return (
    <div>
      {phase === 1 ? (
        <button ref={openButton} key={phase} onClick={() => setPhase(2)}>
          Show Dialog
        </button>
      ) : (
        <button ref={startOverButton} key={phase} onClick={() => setPhase(1)}>
          Start over
        </button>
      )}

      <Dialog
        aria-label="Announcement"
        isOpen={phase === 2}
        onDismiss={() => setPhase(3)}
      >
        <button ref={closeButton} onClick={() => setPhase(3)}>
          Close Dialog
        </button>
        <p>What happens when the button goes away?!</p>
      </Dialog>
    </div>
  );
}

Example.storyName = name;
export { Example };
