Listbox has turned out to be a real test for us in many ways. Primarily, it
challenges our desire for maximum composability, a key goal for all of the
Reach UI components. A listbox select component essentially consists of:

- A button the user clicks when a listbox is closed
- A list of options in a popover that is displayed after a user clicks

This sounds a lot like MenuButton from a UI perspective, but two key
differences:

- ListboxOption holds a value, whereas a MenuItem does not
- The ListboxButton rendered result depends on the currently selected
  ListboxOption

This last point is the kicker! In order for the ListboxButton to know what's
going on the the ListboxList, we need to update state in context and store it
at the top of the tree. This means we can't show the ListboxButton's inner
content on the first render, which means we can't render ListboxButton on
the server ... UNLESS the component state is controlled in the app.

So in most Reach components, we offer the user the ability to choose between
uncontrolled or controlled state. For an uncontrolled component, all you'd
have to do is compose the parts and everything just works. AWESOME.

We still offer that choice for Listbox, but the concession here is that if
you are server rendering your component you may get a server/client mismatch.
For this reason, if you are server rendering we always recommend using
controlled state for your listbox and explicitly tell the button what to
render at the top of the tree.
