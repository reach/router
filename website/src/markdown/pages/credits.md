# Credits and Trade-offs

Hey, it's Ryan Florence here.

## Credits

### React Router

In May of 2014 I created the first version of React Router and was involved with the project all the way to the end of 2017 at version 4. Because of that, Reach Router is clearly influenced by React Router and all of the ideas of the contributors who built it.

To me, Reach Router is everything I missed about v3 and everything I love about v4, plus a few things I've always wanted a router in React to have, particularly focus management and relative links. I want a more accessible web, especially in React.

### Ember + Preact Router

When multiple routes match the location, Ember and Preact Router pick the route that you intend to match, rather than relying on order or props like React Router v4's `exact`. The path ranking feature of Reach Router was inspired by them both.

## Trade-offs (mostly compared to React Router)

* Size. I'm aiming to come in under 4kb for a modern React app (where API polyfills aren't needed). That makes some extra features harder to include.

* No complex route patterns. There are no optional params, or anything like them, it's just static paths, params, and trailing wildcard.

* No history blocking. I found that the only use-case I had was preventing the user from navigating away from a half-filled out form. Not only is it pretty easy to just save the form state to session storage and bring it back when they return, but history blocking doesn't happen when you navigate away from the app (say to another domain). This kept me from actually using history blocking and always opting to save the form state to session storage.

* No React Native support. Not yet anyway. An important goal is "accessible by default". Assuming a DOM makes this goal easier to attain and maintain. Also, there's a sea of navigation projects for React Native that I'm not interested in swimming in! Maybe in the future, though.
