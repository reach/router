export { pick, match, resolve };

function pick(routes, uri) {
  let match;
  let default_;

  let [uriPathname] = uri.split("?");
  let uriSegments = segmentize(uriPathname);
  let ranked = rankRoutes(routes);
  let matchedSegmentCount = 0;

  for (let i = 0, l = ranked.length; i < l; i++) {
    let route = ranked[i].route;

    if (route.default) {
      default_ = route;
      continue;
    }

    let routeSegments = segmentize(route.pattern);
    let params = {};

    for (let i = 0, l = routeSegments.length; i < l; i++) {
      let routeSegment = routeSegments[i];
      let uriSegment = uriSegments[i];

      if (uriSegment === undefined) {
        matchedSegmentCount = 0;
        break;
      }

      let isSplat = routeSegment === "*";
      if (isSplat) {
        params["*"] = uriSegments
          .slice(i)
          .map(decodeURIComponent)
          .join("/");
        matchedSegmentCount = i;
        break;
      }

      let dynamicMatch = paramRe.exec(routeSegment);
      if (dynamicMatch) {
        let value = decodeURIComponent(uriSegment);
        params[dynamicMatch[1]] = value;
      } else if (routeSegment !== uriSegment) {
        matchedSegmentCount = 0;
        break;
      }

      matchedSegmentCount++;
    }

    if (matchedSegmentCount) {
      match = { route, params };
      break;
    }
  }

  if (match) {
    return Object.assign({}, match, {
      uri: "/" + uriSegments.slice(0, matchedSegmentCount).join("/")
    });
  }

  if (default_) {
    return {
      route: default_,
      params: {},
      uri
    };
  }

  return null;
}

function match(pattern, uri) {
  return pick([{ pattern }], uri);
}

function resolve(to, base) {
  if (to.startsWith("/")) {
    // /foo/bar, /baz/qux => /foo/bar
    return to;
  }

  let [toPathname, toQuery] = to.split("?");
  let [basePathname, baseQuery] = base.split("?");

  let toSegments = segmentize(toPathname);
  let baseSegments = segmentize(basePathname);

  if (toSegments[0] === "") {
    // ?a=b, /users?b=c => /users?a=b
    return addQuery(basePathname, toQuery);
  }

  if (!toSegments[0].startsWith(".")) {
    // 456, /users/789 => /users/456
    let pathname =
      "/" +
      baseSegments
        .slice(0, baseSegments.length - 1)
        .concat(toSegments)
        .join("/");
    return addQuery(pathname, toQuery);
  }

  let segments = baseSegments
    .slice(0, baseSegments.length - 1)
    .concat(toSegments);

  let ups = 0;
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    if (segment === ".") {
      segments.splice(i, 1);
    } else if (segment === "..") {
      segments.splice(i, 1);
      ups++;
    } else if (ups > 0) {
      segments.splice(i, 1);
      ups--;
    }
  }

  return addQuery("/" + segments.join("/"), toQuery);
}

////////////////////////////////////////////////////////////////////////

let paramRe = /^:(.+)/;

let SEGMENT_POINTS = 4;
let STATIC_POINTS = 3;
let DYNAMIC_POINTS = 2;
let SPLAT_POINTS = 1;
let ROOT_POINTS = 1;

let isRootSegment = segment => segment == "";
let isDynamic = segment => paramRe.test(segment);
let isSplat = segment => segment === "*";

let rankRoute = (route, index) => {
  let score = route.default
    ? 0
    : segmentize(route.pattern).reduce((score, segment) => {
        score += SEGMENT_POINTS;
        if (isRootSegment(segment)) score += ROOT_POINTS;
        else if (isDynamic(segment)) score += DYNAMIC_POINTS;
        else if (isSplat(segment)) score += SPLAT_POINTS;
        else score += STATIC_POINTS;
        return score;
      }, 0);
  return { route, score, index };
};

let rankRoutes = routes =>
  routes
    .map(rankRoute)
    .sort(
      (a, b) =>
        a.score < b.score
          ? 1
          : a.score > b.score ? -1 : a.index - b.index
    );

let segmentize = uri =>
  uri
    // strip starting/ending slashes
    .replace(/(^\/+|\/+$)/g, "")
    .split("/");

let addQuery = (pathname, query) =>
  pathname + (query ? `?${query}` : "");
