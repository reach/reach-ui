import React, { useEffect, useRef } from "react";
// import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { MDXProvider } from "@mdx-js/react";
import Alert from "@reach/alert";
import {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogContent
} from "@reach/alert-dialog";
import { useId } from "@reach/auto-id";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText
} from "@reach/combobox";
import Component from "@reach/component-component";
import { Dialog, DialogOverlay, DialogContent } from "@reach/dialog";
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuPopover,
  MenuLink
} from "@reach/menu-button";
import Portal from "@reach/portal";
import Rect, { useRect } from "@reach/rect";
import {
  Slider,
  SliderInput,
  SliderTrack,
  SliderTrackHighlight,
  SliderHandle,
  SliderMarker
} from "@reach/slider";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import Tooltip, { useTooltip, TooltipPopup } from "@reach/tooltip";
import VisuallyHidden from "@reach/visually-hidden";
import WindowSize, { useWindowSize } from "@reach/window-size";
import GatsbyLink from "gatsby-link";
import matchSorter from "match-sorter";
import { useTransition, animated } from "react-spring/web.cjs";
import { Phased } from "recondition";
import { useThrottle } from "use-throttle";
import Layout from "./Layout";
import { PreComponent } from "./MdxPre";
import "../styles/app.scss";

function Table(props) {
  return <table className="u-full-width" {...props} />;
}

let firstLoad = true;

function MyPageLayout({ children }) {
  let contentFocusRef = useRef(null);
  useEffect(() => {
    if (firstLoad) {
      firstLoad = false;
    } else if (contentFocusRef.current) {
      /*
       * If it exists, focus the first H1 heading we find in the main content
       * area instead of the content area itself.
       * We could also consider injecting a "skip back" link component per the
       * suggestions in the Gatsby blog which could be a cool POC
       * https://www.gatsbyjs.org/blog/2019-07-11-user-testing-accessible-client-routing/
       */
      let sectionHeading = contentFocusRef.current.querySelector("h1");
      let focusNode = sectionHeading || contentFocusRef.current;
      focusNode.tabIndex = -1;
      focusNode.focus();
    }
    // I dunno, I just made it global on window, whatever...
    import("./cities.js");
  }, []);

  return (
    <Layout>
      <MDXProvider
        components={{
          pre: function(props) {
            return (
              <PreComponent
                {...props}
                theme={{ plain: {}, styles: [] }}
                scope={{
                  ...React,
                  animated,
                  GatsbyLink,
                  Component,
                  Rect,
                  useRect,
                  WindowSize,
                  useWindowSize,
                  Portal,
                  Menu,
                  MenuList,
                  MenuButton,
                  MenuItem,
                  MenuItems,
                  MenuPopover,
                  MenuLink,
                  VisuallyHidden,
                  Dialog,
                  DialogOverlay,
                  DialogContent,
                  useTransition,
                  Phased,
                  Alert,
                  AlertDialog,
                  AlertDialogDescription,
                  AlertDialogLabel,
                  AlertDialogOverlay,
                  AlertDialogContent,
                  Tabs,
                  TabList,
                  Tab,
                  TabPanels,
                  TabPanel,
                  Slider,
                  SliderInput,
                  SliderTrack,
                  SliderTrackHighlight,
                  SliderHandle,
                  SliderMarker,
                  useId,
                  Tooltip,
                  TooltipPopup,
                  useTooltip,
                  Combobox,
                  ComboboxInput,
                  ComboboxPopover,
                  ComboboxList,
                  ComboboxOption,
                  ComboboxOptionText,
                  useThrottle,
                  matchSorter
                }}
              />
            );
          },
          table: Table
        }}
      >
        <main>
          <div ref={contentFocusRef}>{children}</div>
        </main>
      </MDXProvider>
    </Layout>
  );
}

export default MyPageLayout;
