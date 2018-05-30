## Pull Requests

Please don't send pull requests for new features, open an issue to discuss.

## Running tests

This repo uses Jest.

```sh
yarn test
# or
yarn test --watch
```

## Developing the examples

First you have to link the lib.

```sh
# from the root
yarn build
yarn link
```

Then in one tab compile on file changes

```
yarn watch
```

And in another tab run the example

```sh
# in a new tab
cd examples/<whatever>
yarn link "@reach/router"
yarn start
```
