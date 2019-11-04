/*
Let's see if we can make sense of why this hook exists and it's implementation.

Some background:

1. Accessibiliy APIs rely heavily on element IDs
2. Requiring developers to put IDs on every element in Reach UI is both
   cumbersome and error-prone.
3. With a component model, we can generate IDs for them!

Solution 1: Generate random IDs.

This works great as long as you don't server render your app. If you server
render then when React in the client tries to reuse the markup from the server,
the IDs won't match and React will then recreate the entire DOM tree.

Solution 2: Increment an integer 

This sounds great. Since we're rendering the exact same tree on the server and client,
we can increment a counter and get a deterministic result between client and server.
Also, JS integers can go up to nine-quadrillion--pretty sure the tab will be closed
before an app never needs 10 quadrillion ids.

Ah but there's a catch. React's concurrent rendering makes this approach
non-deterministic. While the client and server will end up with the same
elements in the end, depending on suspense boundaries (and I guess user input
during initial render?) the incrementing integers won't always match up.

Solution 3: Don't use IDs at all then patch-up after first render.

What we've done here is solution 2 with some tricks. With this approach, the ID
returned is an empty string on the first render. This way the server and client
have the same markup no matter how wild the concurrent rendering may have
gotten.

After the render, we patchup the components with an incremented ID. It doesn't
have to be incremented though, we could do something random too, but
incrementing a number is probably the cheapest thing we can do.

*/
import { useState, useEffect, useLayoutEffect } from "react";

let serverHandoffComplete = false;
let id = 0;
const genId = () => ++id;

export const useId = () => {
  // if this instance isn't part of the initial render, we don't have to do the
  // double render/patchup dance. We can just generate the ID and return it.
  const initialId = serverHandoffComplete ? genId() : null;

  const [id, setId] = useState(initialId);

  useLayoutEffect(() => {
    if (id === null) {
      // patch-up the ID after render, do this in useLayoutEffect to avoid any
      // rendering flicker, though it'll make the first render slower (unlikely
      // to matter, you're welcome to measure your app and let us know if it's
      // a problem.)
      setId(genId()), [];
    }
  });

  useEffect(() => {
    if (serverHandoffComplete === false) {
      // Mark all future uses of `useId` to skip the update dance. This is in
      // useEffect because it goes after useLayoutEffect, ensuring we don't
      // accidentally bail out of the patchup dance prematurely.
      serverHandoffComplete = true;
    }
  }, []);
  return id;
};
