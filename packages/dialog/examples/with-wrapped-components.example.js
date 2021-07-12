import * as React from "react";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "With Wrapped Components";

function Example() {
  const overlayRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const [showDialog, setShowDialog] = React.useState(false);
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

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

const FilteredDialogOverlay = React.forwardRef(function (
  { fakeProp, ...rest },
  ref
) {
  return (
    <DialogOverlay
      {...rest}
      ref={ref}
      style={{ background: "rgba(0, 50, 150, 0.9)" }}
    />
  );
});

const FilteredDialogContent = React.forwardRef(function (
  { fakeProp, ...rest },
  ref
) {
  return (
    <DialogContent
      {...rest}
      ref={ref}
      style={{ boxShadow: "0px 10px 50px hsla(0, 0%, 0%, 0.33)" }}
    />
  );
});
