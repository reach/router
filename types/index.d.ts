import * as React from "react";

type WindowLocation = Window["location"];

export type History = {
  readonly location: string;
  readonly transitioning: boolean;
  listen: (listener: HistoryListener) => HistoryUnsubscribe;
  navigate: NavigateFn;
};

export type HistoryListener = () => void;
export type HistoryUnsubscribe = () => void;

export interface RouterProps {
  basepath?: string;
  primary?: boolean;
  location?: WindowLocation;
}

export class Router extends React.Component<RouterProps> {}

export interface LinkProps<TState>
  extends React.HTMLAttributes<HTMLAnchorElement> {
  to?: string;
  replace?: boolean;
  getProps?: (props: LinkGetProps) => {};
  state?: TState;
}

export interface LinkGetProps {
  isCurrent: boolean;
  isPartiallyCurrent: boolean;
  href: string;
  location: WindowLocation;
}

export class Link<TState> extends React.Component<LinkProps<TState>> {}

export type RouteComponentProps<TParams = {}> = Partial<TParams> & {
  path?: string;
  default?: boolean;
  location?: WindowLocation;
  navigate?: NavigateFn;
  uri?: string;
};

export interface RedirectProps {
  from?: string;
  to: string;
  noThrow?: boolean;
}

export class Redirect extends React.Component<RedirectProps> {}

export interface MatchProps<TParams> {
  path: string;
  children: MatchRenderFn<TParams>;
}

export type MatchRenderFn<TParams> = (
  props: MatchRenderProps<TParams>
) => React.ReactNode;

export interface MatchRenderProps<TParams> {
  match: null | { uri: string; path: string } & TParams;
  location: WindowLocation;
  navigate: NavigateFn;
}

export class Match<TParams> extends React.Component<MatchProps<TParams>> {}

export type NavigateFn = <TState>(
  to: string,
  options?: NavigateOptions<TState>
) => void;

export interface NavigateOptions<TState> {
  state?: TState;
  replace?: boolean;
}

export class Location extends React.Component<LocationContext> {}

export interface LocationProviderProps {
  history: History;
  children?: React.ReactNode | LocationProviderRenderFn;
}

export type LocationProviderRenderFn = (
  context: LocationContext
) => React.ReactNode;

export interface LocationContext {
  location: WindowLocation;
  navigate: NavigateFn;
}

export class LocationProvider extends React.Component<LocationProviderProps> {}

export interface ServerLocationProps {
  url: string;
}

export class ServerLocation extends React.Component<ServerLocationProps> {}

export const navigate: NavigateFn;

export interface HistorySource {
  readonly location: WindowLocation;
  addEventListener(name: string, listener: (event: Event) => void): void;
  removeEventListener(name: string, listener: (event: Event) => void): void;
  history: {
    readonly state: any;
    pushState(state: any, title: string, uri: string): void;
    replaceState(state: any, title: string, uri: string): void;
  };
}

export function createHistory(source: HistorySource): History;

export function createMemorySource(initialPath: string): HistorySource;

export interface RedirectRequest {
  uri: string;
}

export function isRedirect(error: any): error is RedirectRequest;

export function redirectTo(uri: string): void;
