// Fast network always
// slow initial load
// show loading quickly on initial load, don't show top level placeholder on navigation
import React from "react";
import Edit from "react-icons/lib/ti/edit";
import { Router, Link, Redirect } from "@reactions/router";
import {
  login,
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact
} from "./utils";
import createContext from "create-react-context";

console.log(React.version);

const InvalidateContacts = createContext();
const withInvalidateContacts = Comp => props => (
  <InvalidateContacts.Consumer>
    {invalidate => <Comp {...props} invalidateContacts={invalidate} />}
  </InvalidateContacts.Consumer>
);

class Contacts extends React.Component {
  state = { result: null };

  componentDidMount() {
    this.load();
  }

  load = async () => {
    const result = await getContacts();
    this.setState({ result });
  };

  render() {
    const { result } = this.state;

    if (!result) return null;

    const { contacts } = this.state.result;
    const { children } = this.props;

    return (
      <InvalidateContacts.Provider value={this.load}>
        <div>
          <div style={{ display: "flex" }}>
            <div>
              <h1>Contacts</h1>
              <p>
                <Link to="contact/new">New Contact</Link> |{" "}
                <Link to="/">Home</Link>
              </p>
              <ul>
                <li>
                  <Link to="/contacts/ryan">Redirect Ryan</Link>
                  <br />
                  <small>
                    You might need to close the create-react-app error overlay
                  </small>
                </li>
                {contacts.map(contact => (
                  <li key={contact.id}>
                    <Link to={`contact/${contact.id}`}>{contact.first}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ marginLeft: "100px" }}>{children}</div>
          </div>
        </div>
      </InvalidateContacts.Provider>
    );
  }
}

const Card = withInvalidateContacts(
  class CardImpl extends React.Component {
    state = { result: null };

    async componentDidMount() {
      this.load();
    }

    async load() {
      const result = await getContact(this.props.id);
      this.setState({ result });
    }

    async componentDidUpdate(prevProps) {
      if (prevProps.id !== this.props.id) {
        this.load();
      }
    }

    handleSubmit = async event => {
      event.preventDefault();
      const [first, last] = event.target.elements;
      const { id } = this.props;
      await updateContact(id, { first: first.value, last: last.value });
      // get the list on the left to update
      this.props.invalidateContacts();
      // update this
      this.load();
      // update the URL
      this.props.navigate(`..`);
    };

    handleDelete = async () => {
      await deleteContact(this.props.id);
      this.props.invalidateContacts();
      this.props.navigate("../..");
    };

    render() {
      const { result } = this.state;

      if (!result) return null;
      if (!result.contact) {
        return result.status === 404 ? <NotFound /> : <Error />;
      }

      const { contact } = result;
      const { edit } = this.props;
      return (
        <div>
          <h1>
            {edit ? (
              <form onSubmit={this.handleSubmit}>
                <input
                  style={{ font: "inherit" }}
                  type="text"
                  size="15"
                  defaultValue={contact.first}
                />{" "}
                <input
                  style={{ font: "inherit" }}
                  type="text"
                  size="15"
                  defaultValue={contact.last}
                />{" "}
                <button type="submit">Save</button>{" "}
                <Link to="../" replace>
                  Cancel
                </Link>
              </form>
            ) : (
              <div>
                {contact.first} {contact.last}{" "}
                <Link to="edit" aria-label="edit">
                  <Edit />
                </Link>
              </div>
            )}
          </h1>
          <img alt="avatar" src={contact.avatar} height="200" />
          <p>
            <button onClick={this.handleDelete}>Delete</button>
          </p>
        </div>
      );
    }
  }
);

const About = () => <h1>Reactions Router Demo!</h1>;

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

const Create = withInvalidateContacts(
  class extends React.Component {
    state = {
      state: CreateStates.IDLE,
      error: null
    };

    handleSubmit = async event => {
      event.preventDefault();
      this.setState(() => ({ state: CreateStates.SAVING }));
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
      if (res.contact) {
        this.props.invalidateContacts();
        this.props.navigate(`../${res.contact.id}`);
        // this.props.navigate(res.contact.id);
      } else {
        const text = await res.text();
        this.setState({
          error: text,
          state: CreateStates.ERROR
        });
      }
    };

    render() {
      const { state, error } = this.state;
      return (
        <form onSubmit={this.handleSubmit}>
          <p>
            <Field title="First Name" />
            <Field title="Last Name" />
            <Field title="Avatar URL" />
          </p>
          <button
            disabled={state === CreateStates.SAVING}
            type="submit"
            style={{
              opacity: state === CreateStates.SAVING ? "0.5" : "",
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
            <li>To cause an error, try using the first name "Millenial"</li>
            <li>
              For slow responses use the browser debugger to throttle your
              network.
            </li>
          </ul>
          {state === CreateStates.ERROR && (
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
              <b>{error}</b>
            </p>
          )}
        </form>
      );
    }
  }
);

const NotFound = () => <div>Sorry, nothing here.</div>;
const Error = () => <div>Sorry, something's wrong on the server.</div>;

class App extends React.Component {
  state = {
    loggedIn: false
  };

  async componentDidMount() {
    await login();
    this.setState({ loggedIn: true });
  }

  render() {
    if (!this.state.loggedIn) return null;

    return (
      <Router>
        <Contacts path="/">
          <About path="/" />
          <Card path="contact/:id" />
          <Card path="contact/:id/edit" edit={true} />
          <Create path="contact/new" />
          <Redirect from="contacts/:id" to="contact/:id" />
          <NotFound default />
        </Contacts>
      </Router>
    );
  }
}

export default App;
