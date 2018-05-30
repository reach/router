# Path Ranking

Reach router ranks your paths so you don't have to worry about the order of your paths or pass in props to help it know how to match. Generally, you shouldn't have to worry about this at all, just don't think about it and it will do exactly what you want it to.

However, I know you're a programmer and so you want to know how it works.

A path is assigned a score based on the value of each segment in the path. The path with the highest score that matches the location wins.

* Each segment gets 4 points and then...
* Static segments get 3 more points
* Dynamic segments 2 more
* Root segments 1
* and finally wildcard segments get a 1 point penalty

Here's a "table" showing different paths and their scores:

| Score | Path                             |
| ----- | -------------------------------- |
| 5     | `/`                              |
| 7     | `/groups`                        |
| 13    | `/groups/:groupId`               |
| 14    | `/groups/mine`                   |
| 19    | `/groups/:groupId/users/\*`      |
| 20    | `/groups/:groupId/users`         |
| 21    | `/groups/mine/users`             |
| 24    | `/:one/:two/:three/:four`        |
| 26    | `/groups/:groupId/users/:userId` |
| 27    | `/groups/:groupId/users/me`      |
| 28    | `/groups/mine/users/me`          |
| 30    | `/:one/:two/:three/:four/:five`  |

A URL like "/groups/mine" matches both paths "/groups/:groupId" and "/groups/mine", but "/groups/mine" has 14 points while the other only has 13, so "/groups/mine" wins.
