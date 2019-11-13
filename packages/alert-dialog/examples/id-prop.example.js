import React, { useRef, useState } from "react";
import {
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogLabel,
  AlertDialogDescription
} from "@reach/alert-dialog";

export let name = "ID Props";

export function Example() {
  const [showDialog, setShowDialog] = useState(false);

  // we'll pass this ref to both AlertDialog and our button
  const cancelRef = useRef();

  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  return (
    <div>
      <button onClick={open}>Delete something</button>

      {showDialog && (
        <AlertDialogOverlay
          style={{ background: "hsla(0, 50%, 50%, 0.85)" }}
          leastDestructiveRef={cancelRef}
          id="myAlertDialogOverlay"
        >
          <AlertDialogContent
            id="myAlertDialogContent"
            style={{ background: "#f0f0f0" }}
          >
            <AlertDialogLabel id="myAlertDialogLabel">
              Please Confirm!
            </AlertDialogLabel>

            <AlertDialogDescription id="myAlertDialogDescription">
              Are you sure you want delete stuff, it will be permanent.
            </AlertDialogDescription>

            <div className="alert-buttons">
              <button onClick={close}>Yes, delete</button>{" "}
              <button ref={cancelRef} onClick={close}>
                Nevermind
              </button>
            </div>
          </AlertDialogContent>
        </AlertDialogOverlay>
      )}
    </div>
  );
}
