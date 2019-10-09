import "./normalize.css"
import "./skeleton.css"
import "./syntax.css"
import "./app.css"

import React from "react"
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live"
import { MDXProvider } from "@mdx-js/react"
import Layout from "./layout"
import { useThrottle } from "use-throttle"
import matchSorter from "match-sorter"

import GatsbyLink from "gatsby-link"

import Component from "@reach/component-component"
import Rect, { useRect } from "@reach/rect"
import WindowSize from "@reach/window-size"
import Portal from "@reach/portal"
import { Dialog, DialogOverlay, DialogContent } from "@reach/dialog"
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuLink,
} from "@reach/menu-button"
import VisuallyHidden from "@reach/visually-hidden"
import Alert from "@reach/alert"
import {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogContent,
} from "@reach/alert-dialog"

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from "@reach/combobox"

import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs"

import { useId } from "@reach/auto-id"

import Tooltip, { useTooltip, TooltipPopup } from "@reach/tooltip"

import { Transition } from "react-spring/web.cjs"

import { Phased } from "recondition"

const PreComponent = ({ className, ...props }) => {
  console.log(props.children.props)
  return props.children.props &&
    props.children.props.className === "language-jsx" ? (
    <LiveProvider
      theme={{ plain: {}, styles: [] }}
      code={props.children.props.children.trim()}
      //code={props.children.trim()}
      // ode={props.children}
      scope={{
        ...React,
        GatsbyLink,
        Component,
        Rect,
        useRect,
        WindowSize,
        Portal,
        Menu,
        MenuList,
        MenuButton,
        MenuItem,
        MenuLink,
        VisuallyHidden,
        Dialog,
        DialogOverlay,
        DialogContent,
        Transition,
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
        matchSorter,
      }}
    >
      <LiveEditor className="shit" tabIndex="-1" />
      <LiveError />
      <LivePreview />
    </LiveProvider>
  ) : (
    <pre {...props} className="WHAT_THE_CRAP" />
  )
}

const Table = props => <table className="u-full-width" {...props} />

let firstLoad = true

export default class MyPageLayout extends React.Component {
  componentDidMount() {
    if (firstLoad) {
      firstLoad = false
    } else {
      this.node.focus()
    }
    // I dunno, I just made it global on window, whatever...
    import("./cities.js")
  }

  render() {
    return (
      <Layout>
        <MDXProvider components={{ pre: PreComponent, table: Table }}>
          <main
            ref={n => (this.node = n)}
            tabIndex="-1"
            style={{ outline: "none" }}
            role="group"
          >
            {this.props.children}
          </main>
        </MDXProvider>
      </Layout>
    )
  }
}
