import { useUIDSeed } from "react-uid";

// strips trailing '-' if postfix is an empty string
const clean = (string = "") => string.replace(/-$/, "");

export const useId = (postfix = "") => {
  const seed = useUIDSeed();
  if (typeof postfix !== "string" && typeof postfix !== "number") {
    console.warn(
      `The argument passed to useId must be either a string or a number, but a ${typeof postfix} was detected. A random string has been generated as a fallback which may break the accessibility of your application depending on how the hook is used. See [LINK TO DOCS] for details.`
    );
    postfix = "";
  }
  return !postfix ? clean(seed(postfix)) : seed(postfix);
};
