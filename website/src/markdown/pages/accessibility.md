# Accessibility

Accessibilty is a first-class concern for Reach Router, so, naturally, it's baked in.

## Links

Links in a client rendered app should behave just like links in a server rendered app. Reach Router does this automatically for you:

* Keyboard access
* Assistive devices announce correctly
* Command/Control click opens in a new tab
* Right click "open in new window" opens in a new window

## Focus Management

Whenever the content of a page changes in response to a user interaction, the focus should be moved to that content; otherwise, users on assistive devices have to search around the page to find what changed--yuck! Without the help of a router, managing focus on route transitions requires a lot effort and knowledge on your part.

Reach Router provides out-of-the-box focus management so your apps are significantly more accessible without you breaking a sweat.

When the location changes, the top-most part of your application that changed is identified and focus is moved to it. Assistive devices then announce to the user the group of elements they are now focused on, similarly to how it works when they load up a page for the first time.
