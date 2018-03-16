import { createResource } from "simple-cache-provider";

const sleep = (ms = 1000) => new Promise(res => setTimeout(res, ms));

let token = null;

export const login = createResource(
  () =>
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
    })
);

const API = `https://contacts.now.sh`;
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

export const readContacts = createResource(() =>
  fetchContacts("/contacts")
);

export const readContact = createResource(id =>
  fetchContacts(`/contacts/${id}`)
);

export const createContact = contact =>
  fetchContacts("/contacts", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ contact })
  });
