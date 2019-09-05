# TypeScript

Reach Router may be used with [TypeScript](https://www.typescriptlang.org/).

## Install Typings

```sh
npm install @types/reach__router --save-dev
# or
yarn add @types/reach__router --dev
```

## Rendering

To set props like `path` and `default` on routes, use the `RouteComponentProps` interface.

```tsx
import * as React from "react"
import { render } from "react-dom"
import { Router, RouteComponentProps, Link } from "@reach/router"

let Home = (props: RouteComponentProps) => <div>Home</div>
let Dash = (props: RouteComponentProps) => <div>Dash</div>

render(
  <Router>
    <Home path="/" />
    <Dash path="dashboard" />
  </Router>
)
```

## Parse Data From the URL

To access data parsed from the URL, create a new interface that extends `RouteComponentProps`, and add each of the URL's dynamic segments as a new prop. These props should be optional and typed as `string`.

```tsx
// at url "/invoice/23"

render(
  <Router>
    <Home path="/" />
    <Invoice path="invoice/:invoiceId" />
  </Router>
)

interface InvoiceProps extends RouteComponentProps
{
	invoiceId?: string;
}

const Invoice = (props: InvoiceProps) => (
  <div>
    <h1>Invoice {props.invoiceId}</h1>
  </div>
)
```
