const sleep = (ms = 1000) => new Promise(res => setTimeout(res, ms));

const API = `https://contacts.now.sh`;
// const API = `http://localhost:5000`;

let token = null;

export const login = () =>
  new Promise(async (res, rej) => {
    token = localStorage.getItem("token");
    if (token) {
      res(token);
    } else {
      token = prompt("Give me a token, anything will do!");
      if (token.trim() === "")
        token = Math.random()
          .toString(32)
          .substr(2, 8);
      localStorage.setItem("token", token);
      // fake some async waiting
      await sleep();
      res(token);
    }
  });

const fetchContacts = async (url, opts = { headers: {} }) => {
  return fetch(`${API}${url}`, {
    ...opts,
    headers: { authorization: token, ...opts.headers }
  }).then(res => {
    if (res.ok) {
      return res.json();
    } else {
      return res;
    }
  });
};

export const getContacts = () => fetchContacts("/contacts");

export const getContact = id => fetchContacts(`/contacts/${id}`);

export const updateContact = (id, contact) =>
  fetchContacts(`/contacts/${id}`, {
    method: "put",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact })
  });

export const deleteContact = id =>
  fetchContacts(`/contacts/${id}`, {
    method: "delete"
  });

export const createContact = contact =>
  fetchContacts("/contacts", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact })
  });
