# Development notes

**_Updated 2-19-20_**

This one feels like it's in a good place for the most part! Notes below reflect some things that still need work and some more testing we'll need to do.

## Things that aren't currently working:

- Uncontrolled listbox (discussed in the past, but should we just make an exception for this component and say the value state has to be controlled? If so I can remove a bit of code!)
- When a user first starts to click the button, the `mousedown` event opens a closed listbox so the user can drag into the list and select an option with `mouseup` just like native select menus. If the `mouseup` event fires on the button instead of an option, the list is focused so that keyboard handlers work. So far so good EXCEPT for the fact that whatever option value matches the value of the listbox should be immediately highlighted on open and then focused instead of the list! This works fine when a keyboard event opens the listbox, but even though the button events trigger the same actions in the state machine I can't figure out what's going on here! See line 331 in `listbox/src/machine.ts`.

## Things that need testing/clarity:

- Screen readers (aside from VoiceOver)
- Touch events: I assume since we did some tricky stuff with mouse-events vs. clicks, touch will have some nuances we need to cover.
- Not sure what expected behavior should be for tab key. Should we focus lock inside the popover or close the popover? Native selects will close on tab in some browsers, but it's not universal. Right now if the user tabs out of the listbox it just closes.
- I made some assumptions about how `autoComplete` might work, but we'll need to spin this up in a form and test to be sure. Probably need to borrow the logic I used in `radio` to trigger a form submit on enter when the listbox is closed.
