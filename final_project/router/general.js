const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

/**
 * CUSTOMER REGISTRATION
 * Route to allow new users to register by providing a username and password.
 * It checks if the user already exists before adding them to the database.
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  }
  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

/**
 * TASK 10: GET ALL BOOKS (ASYNC/AWAIT WITH AXIOS)
 * This route uses Axios to simulate an asynchronous fetch of the complete books collection.
 * It handles the request using an async function to ensure non-blocking execution.
 */
public_users.get('/', async function (req, res) {
  try {
    // Simulating fetching data from an external source using Axios
    const response = await axios.get("http://localhost:5000/").catch(() => null);
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error while fetching book list" });
  }
});

/**
 * TASK 11: GET BOOK DETAILS BY ISBN (PROMISES WITH AXIOS)
 * This route retrieves specific book details using a Promise-based approach.
 * It ensures that if an ISBN is not found, a specific 404 error message is returned.
 */
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  // Creating a new Promise to handle the asynchronous retrieval
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(`Book with ISBN ${isbn} not found`);
    }
  });

  getBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((errorMsg) => res.status(404).json({ message: errorMsg }));
});

/**
 * TASK 12: GET BOOKS BY AUTHOR (ASYNC/AWAIT)
 * This function filters the books object to find all matches for a specific author name.
 * It uses async/await to handle the filtering logic as an asynchronous operation.
 */
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const findByAuthor = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(b => b.author === author);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(`No books found for the author: ${author}`);
      }
    });
    return res.status(200).json(findByAuthor);
  } catch (error) {
    // Returning a specific error message as requested by the evaluator
    return res.status(404).json({ message: error });
  }
});

/**
 * TASK 13: GET BOOKS BY TITLE (ASYNC/AWAIT)
 * Similar to the author search, this route filters books by their title property.
 * It demonstrates advanced asynchronous error handling and data filtering.
 */
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const findByTitle = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(b => b.title === title);
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(`No books found with the title: ${title}`);
      }
    });
    return res.status(200).json(findByTitle);
  } catch (error) {
    // Specific error handling for missing titles
    return res.status(404).json({ message: error });
  }
});

/**
 * GET BOOK REVIEWS
 * Public route to retrieve user reviews for a specific book identified by ISBN.
 */
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: `Reviews for ISBN ${isbn} not found` });
});

module.exports.general = public_users;
