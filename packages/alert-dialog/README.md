# @reach/alert-dialog

[![Stable release](https://img.shields.io/npm/v/@reach/alert-dialog.svg)](https://npm.im/@reach/alert-dialog) ![MIT license](https://badgen.now.sh/badge/license/MIT)

[Docs](https://reach.tech/alert-dialog) | [Source](https://github.com/reach/reach-ui/tree/main/packages/alert-dialog) | [WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.2/#alertdialog)

A modal dialog that interrupts the user's workflow to get a response, usually some sort of confirmation. This is different than a typical Dialog in that it requires some user response, like "Save", or "Cancel", etc.

Most of the time you'll use `AlertDialog`, `AlertDialogLabel`, and `AlertDialogDescription` together. If you need more control over the styling of the modal you can drop down a level and use `AlertDialogOverlay` and `AlertDialogContent` instead of `AlertDialog`.

When a Dialog opens, the _least destructive_ action should be focused so that if a user accidentally hits enter when the dialog opens no damage is done. This is accomplished with the `leastDestructiveRef` prop.

Every dialog must render an `AlertDialogLabel` so the screen reader knows what to say about the dialog. If an `AlertDialogDescription` is also rendered, the screen reader will also announce that. If you render more than these two elements and some buttons, the screen reader might not announce it so it's important to keep the content inside of `AlertDialogLabel` and `AlertDialogDescription`.

This is built on top of [@reach/dialog](https://reach.tech/dialog), so `AlertDialog` spreads its props and renders a `Dialog`, same for `AlertDialogOverlay` to `DialogOverlay`, and `AlertDialogContent` to `DialogContent`.

```jsx
function Example(props) {
  const [showDialog, setShowDialog] = React.useState(false);
  const cancelRef = React.useRef();
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  return (
    <div>
      <button onClick={open}>Delete something</button>

      {showDialog && (
        <AlertDialog leastDestructiveRef={cancelRef}>
          <AlertDialogLabel>Please Confirm!</AlertDialogLabel>

          <AlertDialogDescription>
            Are you sure you want to delete something? This action is permanent,
            and we're totally not just flipping a field called "deleted" to
            "true" in our database, we're actually deleting something.
          </AlertDialogDescription>

          <div className="alert-buttons">
            <button onClick={close}>Yes, delete</button>{" "}
            <button ref={cancelRef} onClick={close}>
              Nevermind, don't delete.
            </button>
          </div>
        </AlertDialog>
      )}
    </div>
  );
}
```
