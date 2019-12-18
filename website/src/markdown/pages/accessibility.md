# Accessibility

Accessibility is a first-class concern for Reach Router, so, naturally, it's baked in.

## Links

Links in a client rendered app should behave just like links in a server rendered app. Reach Router does this automatically for you:

- Keyboard access
- Assistive devices announce correctly
- Command/Control click opens in a new tab
- Right click "open in new window" opens in a new window

## Focus Management

Whenever the content of a page changes in response to a user interaction, the focus should be moved to that content; otherwise, users on assistive devices have to search around the page to find what changed--yuck! Without the help of a router, managing focus on route transitions requires a lot effort and knowledge on your part.

Reach Router provides out-of-the-box focus management so your apps are significantly more accessible without you breaking a sweat.

When the location changes, the top-most part of your application that changed is identified and focus is moved to it.

## Focus Management

Prior to version `1.3`, we used `role="group"` on the top-level element so that screen readers would announce to the user the focused group's nested elements similarly to how it works when a user loads a page for the first time. A problem we found is that some screen readers (notably VoiceOver and NVDA with Firefox) will read the group's content as if it's a long string, void of any important context provided by the interior markup.

While we removed the group role as the router's default setting, if you believe the group role creates a better experience for your application you can still pass it as a prop to the `Router` component and it will be forwarded to the top-level element and function the same as before.
