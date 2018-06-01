# LocationProvider

Sets up a listener to location changes. The primary API's that need the location automatically set this up for you. This is mostly useful for testing, and if we ever decide to get into React Native, it'll be useful there too.

```jsx
import {
  createMemorySource,
  createHistory,
  LocationProvider
} from "@reach/router"

let history = createHistory(window)

// for some types of tests you want a memory source
let source = createMemorySource("/starting/url")
let history = createHistory(source)

let App = () => (
  <LocationProvider history={history}>
    <div>
      Alright, we've established some location
      context
    </div>
  </LocationProvider>
)
```

## history: object (optional)

The history to listen to. Defaults to the browser history or a memory history if a DOM is not found.

```jsx
import { createHistory, LocationProvider } from '@reach/router'
let history = createHistory(window)

<LocationProvider history={history}/>
```

## children: element

You can pass elements as children to wrap an app in location context.

```jsx
<LocationProvider>
  <div>This is fine</div>
</LocationProvider>
```

## children: func

If you pass a child render function `LocationProvider` will pass you the context it creates: `location` and `navigate`. If you want access to these values somewhere arbitrary in your app, use [Location](Location) instead.

```jsx
<LocationProvider>
  {context => {
    console.log(context.location)
    console.log(context.navigate)
  }}
</LocationProvider>
```
