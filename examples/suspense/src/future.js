import React, {Component, PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {createResource, createCache} from 'simple-cache-provider';

export let cache;
function initCache() {
  cache = createCache(initCache);
}
initCache();

export function createFetcher(fetch) {
  const res = createResource(fetch);
  return {
    read(...args) {
      return res(cache, ...args);
    },
  };
}

export function Placeholder(props) {
  return (
    <React.Timeout ms={props.delayMs}>
      {didTimeout => (
        <React.Fragment>
          {!didTimeout && props.children}
          {didTimeout && props.fallback}
        </React.Fragment>
      )}
    </React.Timeout>
  );
}

export class ProtectFromClick extends PureComponent {
  state = {enableClicks: false};
  componentDidMount() {
    this.timeout = setTimeout(() => this.enableClicks(), 200);
  }
  enableClicks() {
    this.setState({ enableClicks: true });
  }
  componentWillUnmount() {
    clearInterval(this.timeout);
  }
  render() {
    return (
      <div style={{pointerEvents: this.state.enableClicks ? 'all' : 'none'}}>
        {this.props.children}
      </div>
    );
  }
}

export const Loading = React.Loading;

Component.prototype.deferSetState = function (...args) {
  Promise.resolve().then(() => {
    ReactDOM.unstable_deferredUpdates(() => {
      this.setState.apply(this, args);
    });
  });
}
