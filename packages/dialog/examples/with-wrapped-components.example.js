import React, { forwardRef, useRef, useState } from "react";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";

export let name = "With Wrapped Components";

export function Example() {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  return (
    <div>
      <button onClick={open}>Show Dialog</button>

      <FilteredDialogOverlay
        fakeProp="this should do nothing"
        ref={overlayRef}
        isOpen={showDialog}
        onDismiss={close}
      >
        <FilteredDialogContent
          fakeProp="blah"
          aria-label="Announcement"
          ref={contentRef}
        >
          <p>Got a case of the blues?</p>
          <button onClick={close}>So blue</button>
        </FilteredDialogContent>
      </FilteredDialogOverlay>
    </div>
  );
}

const FilteredDialogOverlay = forwardRef(function({ fakeProp, ...rest }, ref) {
  return (
    <DialogOverlay
      {...rest}
      ref={ref}
      style={{ background: "rgba(0, 50, 150, 0.9)" }}
    />
  );
});

const FilteredDialogContent = forwardRef(function({ fakeProp, ...rest }, ref) {
  return (
    <DialogContent
      {...rest}
      ref={ref}
      style={{ boxShadow: "0px 10px 50px hsla(0, 0%, 0%, 0.33)" }}
    />
  );
});
