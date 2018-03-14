import React from "react";
import { Router, Link } from "./Router";
import {
  login,
  readContacts,
  readContact,
  createContact
} from "./utils";
import withCache from "./withCache";
import Img from "./Img";
import Component from "@reactions/component";

const Contacts = withCache(({ cache, children }) => {
  const { contacts } = readContacts(cache);

  return (
    <div>
      <h1>Contacts</h1>
      <p>
        <Link to="new">New Contact</Link>
      </p>
      <ul>
        {contacts.map(contact => (
          <li key={contact.id}>
            <Link to={contact.id}>{contact.first}</Link>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
});

const Card = withCache(({ cache, id }) => {
  const { contact } = readContact(cache, id);
  return (
    <div>
      <h2>
        {contact.first} {contact.last}
      </h2>
      <Img src={contact.avatar} height="200" />
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

const Create = withCache(({ cache }) => (
  <Component initialState={{ error: null }}>
    {({ setState, state }) => (
      <form
        onSubmit={async event => {
          event.preventDefault();
          const form = event.target;
          const contact = {
            first: form.elements[0].value || "Noname",
            last: form.elements[1].value || "McGee",
            avatar: form.elements[2].value || MONKEY,
            id: Math.random()
              .toString(32)
              .substr(2, 8)
          };
          await createContact(contact);
          // cache.invalidate();
          form.reset();
        }}
      >
        <p>
          <Field title="First Name" />
          <Field title="Last Name" />
          <Field title="Avatar URL" />
        </p>
        <button
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

const App = withCache(({ cache }) => {
  login(cache);
  return (
    <Router>
      <Contacts path="/">
        <About path="/" />
        <Card path=":id" />
        <Create path="new" />
      </Contacts>
    </Router>
  );
});

export default App;
