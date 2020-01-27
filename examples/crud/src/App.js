// Fast network always
// slow initial load
// show loading quickly on initial load, don't show top level placeholder on navigation
import React from "react";
import { Router, Link, Redirect, globalHistory } from "@reach/router";
import {
  login,
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact
} from "./utils";
import createContext from "create-react-context";

globalHistory.listen(({ location, action }) => {
  console.log({ location, action });
});

const InvalidateContacts = createContext();
const withInvalidateContacts = Comp => props => (
  <InvalidateContacts.Consumer>
    {invalidate => <Comp {...props} invalidateContacts={invalidate} />}
  </InvalidateContacts.Consumer>
);

const NavLink = props => (
  <Link
    getProps={({ isPartiallyCurrent }) => ({
      className: isPartiallyCurrent ? "nav-link active" : "nav-link"
    })}
    {...props}
  />
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
        <div className="App">
          <nav className="primary-nav">
            <NavLink to="contact/new">
              <span aria-label="add">+ New Contact</span>
            </NavLink>
            {contacts.map(contact => (
              <NavLink key={contact.id} to={`contact/${contact.id}`}>
                {contact.first} {contact.last}
              </NavLink>
            ))}
          </nav>
          <main className="main-content">{children}</main>
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
      this.setState({ result: null });
      const result = await getContact(this.props.id);
      this.setState({ result });
    }

    componentDidUpdate(prevProps) {
      if (!prevProps.edit && this.props.edit) {
        this.firstInput.focus();
      }
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
            {contact.first} {contact.last}
          </h1>
          <img alt="avatar" src={contact.avatar} height="200" />
          {edit ? (
            <form onSubmit={this.handleSubmit}>
              <p>
                <label>
                  First Name:{" "}
                  <input
                    ref={n => (this.firstInput = n)}
                    type="text"
                    size="15"
                    defaultValue={contact.first}
                  />
                </label>
              </p>
              <p>
                <label>
                  Last Name:{" "}
                  <input type="text" size="15" defaultValue={contact.last} />
                </label>
              </p>
              <p>
                <button type="submit">Save</button>{" "}
                <Link to="../" replace>
                  Cancel
                </Link>
              </p>
            </form>
          ) : (
            <p>
              <Link className="edit" to="edit" aria-label="edit">
                Edit
              </Link>{" "}
              <button className="text-button" onClick={this.handleDelete}>
                Delete
              </button>
            </p>
          )}{" "}
        </div>
      );
    }
  }
);

const About = () => (
  <div>
    <h1>Reach Router CRUD Demo</h1>
    <p>
      Go ahead, click on a few links, edit some records, add some new ones,
      delete some old ones.
    </p>
    <p>
      This is all wired up to a real API, you can watch the network requests in
      the console.
    </p>
    <p>Enjoy.</p>
  </div>
);

const MONKEY = "https://contacts.now.sh/images/monkey.jpg";
const Field = ({ title }) => (
  <label className="Field">
    {title}
    <br />
    <input type="text" size="40" />
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
          <h1>Create Contact</h1>
          <p>
            <Field title="First Name" />
            <Field title="Last Name" />
            <Field title="Avatar URL" />
          </p>
          <button disabled={state === CreateStates.SAVING} type="submit">
            Create Contact
          </button>
          <ul>
            <li>
              You can submit the form with empty values for some dummy data.
            </li>
            <li>To cause an error, try using the first name "Millenial"</li>
          </ul>
          {state === CreateStates.ERROR && (
            <p>
              There was an error:
              <br />
              <br />
              <b>{error}</b>
            </p>
          )}
        </form>
      );
    }
  }
);

const NotFound = () => <p>Sorry, nothing here.</p>;

const Error = () => <p>Sorry, something's wrong on the server.</p>;

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
