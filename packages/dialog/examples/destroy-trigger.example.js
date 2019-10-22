import "@reach/dialog/styles.css";

import React from "react";
import { Dialog } from "@reach/dialog";

export let name = "Destroy Trigger";

export let Example = () => {
  const openButton = React.useRef(null);
  const startOverButton = React.useRef(null);
  const closeButton = React.useRef(null);
  const [phase, setPhase] = React.useState(1);
  const prevPhase = usePrevious(phase);
  React.useEffect(() => {
    if (phase !== prevPhase) {
      switch (phase) {
        case 1:
          openButton.current.focus();
          break;
        case 3:
          startOverButton.current.focus();
          break;
        default:
          break;
      }
    }
  }, [phase, prevPhase]);
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

      <Dialog aria-label="Announcement" isOpen={phase === 2}>
        <button ref={closeButton} onClick={() => setPhase(3)}>
          Close Dialog
        </button>
        <p>What happens when the button goes away?!</p>
      </Dialog>
    </div>
  );
};

// TODO: Move to @reach/utils
function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
