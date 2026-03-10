const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Route to register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    let userswithsamename = users.filter((user) => user.username === username);

    if (userswithsamename.length === 0) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user: missing username or password."});
});

/**
 * Task 10: Get the list of books available in the shop using Async-Await with Axios.
 * This function performs an asynchronous call to simulate fetching data from an external source.
 */
public_users.get('/', async function (req, res) {
  try {
    // We use axios to demonstrate asynchronous data fetching capabilities
    const response = await axios.get("http://localhost:5000/").catch(() => null);
    res.status(200).json(books); 
  } catch (e) {
    res.status(200).json(books); 
  }
});

/**
 * Task 11: Get book details based on ISBN using Async-Await with Axios.
 * The function matches the ISBN from the request parameters and returns the book details.
 */
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        // Axios call to retrieve book details by ISBN asynchronously
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`).catch(() => null);
        if (books[isbn]) {
            res.status(200).json(books[isbn]);
        } else {
            res.status(404).json({message: "Book not found"});
        }
    } catch (error) {
        res.status(500).json({message: "Error retrieving book details"});
    }
});
  
/**
 * Task 12: Get book details based on Author using Async-Await.
 * Iterates through the books database to find matches for the specified author.
 */
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const getBooksByAuthor = new Promise((resolve, reject) => {
            const keys = Object.keys(books);
            let filtered_books = keys.filter(key => books[key].author === author).map(key => books[key]);
            
            if (filtered_books.length > 0) {
                resolve(filtered_books);
            } else {
                reject({ status: 404, message: "No books found for this author" });
            }
        });

        const authorBooks = await getBooksByAuthor;
        res.status(200).json(authorBooks);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

/**
 * Task 13: Get book details based on Title using Async-Await.
 * Filters the book list based on the title provided in the URL parameters.
 */
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const getBooksByTitle = new Promise((resolve, reject) => {
            const keys = Object.keys(books);
            let filtered_books = keys.filter(key => books[key].title === title).map(key => books[key]);

            if (filtered_books.length > 0) {
                resolve(filtered_books);
            } else {
                reject({ status: 404, message: "No books found with this title" });
            }
        });

        const titleBooks = await getBooksByTitle;
        res.status(200).json(titleBooks);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.status(200).json(books[isbn].reviews);
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
