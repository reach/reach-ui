/*
 * @reach/router (and by association, Gatsby) adds a role of `group` to the
 * focus wrapper element. We're going to remove that default behavior in the
 * router, as it results in some wacky reading of all content as a huge string
 * in VoiceOver + NVDA which is less than desirable.
 * This is a workaround for now.
 */
exports.onInitialClientRender = () => {
  let rootEl = document.getElementById("gatsby-focus-wrapper");
  if (rootEl) {
    rootEl.removeAttribute("role");
    // rootEl.removeAttribute("tabindex");
    // rootEl.removeAttribute("style");
    requestAnimationFrame(() => {
      document.body.focus();
    });
  }
};
