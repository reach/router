/* eslint-disable no-undef */

import React from "react"

const createServerContext = (name, defaultValue = null) => {
  if (!globalThis.__SERVER_CONTEXT) {
    globalThis.__SERVER_CONTEXT = {}
  }

  if (!globalThis.__SERVER_CONTEXT[name]) {
    globalThis.__SERVER_CONTEXT[name] = React.createServerContext(name, defaultValue)
  }

  return globalThis.__SERVER_CONTEXT[name]
}

function createServerOrClientContext(name, defaultValue) {
  if (React.createServerContext) {
    return createServerContext(name, defaultValue)
  }

  return React.createContext(defaultValue)
}

export const BaseContext = createServerOrClientContext("Base", {
  baseuri: "/",
  basepath: "/",
})
export const FocusContext = createServerOrClientContext("Focus")
export const LocationContext = createServerOrClientContext("Location")
