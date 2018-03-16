// Fast network always
// slow initial load
// show loading quickly on initial load, don't show top level placeholder on navigation
import React, { Fragment, Loading, Timeout } from "react";
import { Router, Link, navigate } from "./Router";
import {
  login,
  readContacts,
  readContact,
  createContact
} from "./utils";
import withCache from "./withCache";
import Img, { preload as preloadImg } from "./Img";
import Component from "@reactions/component";

console.log(React.version);

const Contacts = withCache(({ cache, children }) => {
  const { contacts } = readContacts(cache);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div>
          <h1>Contacts</h1>
          <p>
            <Link to="contact/new">New Contact</Link> |{" "}
            <Link to="/">Home</Link>
          </p>
          <ul>
            {contacts.map(contact => (
              <li key={contact.id}>
                <Link to={`contact/${contact.id}`}>
                  {contact.first}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginLeft: "100px" }}>{children}</div>
      </div>
    </div>
  );
});

const Card = withCache(({ cache, id, children }) => {
  preloadImg(cache, `https://contacts.now.sh/images/${id}.jpg`);

  const result = readContact(cache, id);

  if (!result.contact) {
    return result.status === 404 ? <NotFound /> : <Error />;
  }

  const { contact } = result;

  return (
    <div>
      <h1>
        {contact.first} {contact.last}
      </h1>
      <Img src={contact.avatar} height="200" />
      {children}
    </div>
  );
});

const About = () => <div>This is a new router demo!</div>;

const MONKEY = "https://contacts.now.sh/images/monkey.jpg";
const Field = ({ title }) => (
  <label
    style={{
      display: "block",
      margin: "20px 0"
    }}
  >
    <b style={{ fontSize: "85%", color: "#888" }}>{title}</b>
    <br />
    <input
      type="text"
      style={{
        fontSize: "125%",
        width: "100%"
      }}
    />
  </label>
);

const CreateStates = {
  IDLE: 0,
  SAVING: 1,
  ERROR: 2
};

const Create = withCache(({ cache }) => (
  <Component
    initialState={{
      state: CreateStates.IDLE,
      error: null
    }}
  >
    {({ setState, state }) => (
      <form
        onSubmit={async event => {
          event.preventDefault();
          setState(() => ({ state: CreateStates.SAVING }));
          const form = event.target;
          const contact = {
            first: form.elements[0].value || "Noname",
            last: form.elements[1].value || "McGee",
            avatar: form.elements[2].value || MONKEY,
            id: Math.random()
              .toString(32)
              .substr(2, 8)
          };
          const res = await createContact(contact);
          cache.invalidate(); // refetches data
          navigate(`/contact/${res.contact.id}`);
        }}
      >
        <p>
          <Field title="First Name" />
          <Field title="Last Name" />
          <Field title="Avatar URL" />
        </p>
        <button
          disabled={state.state === CreateStates.SAVING}
          type="submit"
          style={{
            margin: "10px 0",
            border: "none",
            borderRadius: "100em",
            font: "inherit",
            fontWeight: "bold",
            fontSize: "85%",
            color: "white",
            padding: "10px 20px",
            background: "hsl(200, 50%, 50%)",
            width: "100%"
          }}
        >
          Create Contact
        </button>
        <ul style={{ fontSize: "85%", padding: "10px" }}>
          <li>
            To cause an error, try using the first name "Millenial"
          </li>
          <li>
            For randomly slow responses use the browser debugger to
            throttle your network.
          </li>
        </ul>
        {state.error && (
          <p
            style={{
              background: `hsl(10, 50%, 90%)`,
              border: `solid 1px hsl(10, 50%, 50%)`,
              padding: "10px",
              textAlign: "center"
            }}
          >
            There was an error:<br />
            <br />
            <b>{state.error}</b>
          </p>
        )}
      </form>
    )}
  </Component>
));

const NotFound = () => <div>Sorry, nothing here.</div>;
const Error = () => <div>Sorry, something's wrong on the server.</div>;
// const Whatever = props => <pre>{JSON.stringify(props, null, 2)}</pre>;

const App = withCache(({ cache }) => {
  login(cache);
  return (
    <Router>
      <Contacts path="/">
        <About path="/" />
        <Card path="contact/:id" />
        <Create path="contact/new" />
        <NotFound default />
      </Contacts>
    </Router>
  );
});

const LoadingBar = ({ animate }) =>
  animate ? <div className="loading-bar" /> : null;

export default class Root extends React.Component {
  render() {
    return (
      <Timeout ms={50000}>
        {didTimeout =>
          didTimeout ? (
            <LoadingBar animate={true} />
          ) : (
            <Loading>
              {isLoading => (
                <Fragment>
                  <LoadingBar animate={isLoading} />
                  <App />
                </Fragment>
              )}
            </Loading>
          )
        }
      </Timeout>
    );
  }
}
