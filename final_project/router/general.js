const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Validar que se proporcionen ambos campos
  if (username && password) {
    // Verificar si el usuario ya existe
    let userswithsamename = users.filter((user) => {
      return user.username === username;
    });

    if (userswithsamename.length === 0) {
      // Si no existe, lo agregamos al array
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      // Si ya existe, enviamos el error correspondiente
      return res.status(404).json({message: "User already exists!"});
    }
  }

  // Error si faltan datos en el cuerpo de la solicitud
  return res.status(404).json({message: "Unable to register user: missing username or password."});
});

public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(books), 500);
            });
        };

        const booksList = await getBooks();
        res.status(200).send(JSON.stringify(booksList, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la lista de libros" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        // Creamos una Promesa para simular la búsqueda asíncrona
        const getBook = new Promise((resolve, reject) => {
            setTimeout(() => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject({ status: 404, message: "Book not found" });
                }
            }, 300); // Simulación de retraso de red
        });

        const bookDetails = await getBook;
        res.status(200).send(JSON.stringify(bookDetails, null, 4));

    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Error retrieving book details" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  
  // 1. Obtenemos todas las claves (keys) del objeto books
  const keys = Object.keys(books);
  let filtered_books = [];

  // 2. Iteramos a través del objeto usando las claves
  keys.forEach((key) => {
    if (books[key].author === author) {
      filtered_books.push(books[key]);
    }
  });

  if (filtered_books.length > 0) {
    res.send(JSON.stringify(filtered_books, null, 4));
  } else {
    res.status(404).json({message: "No se encontraron libros de este autor"});
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  
  // Obtenemos todas las claves del objeto books
  const keys = Object.keys(books);
  let filtered_books = [];

  // Iteramos para buscar coincidencias por título
  keys.forEach((key) => {
    if (books[key].title === title) {
      filtered_books.push(books[key]);
    }
  });

  if (filtered_books.length > 0) {
    res.send(JSON.stringify(filtered_books, null, 4));
  } else {
    res.status(404).json({message: "No se encontraron libros con ese título"});
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  // Extraemos el ISBN de los parámetros
  const isbn = req.params.isbn;
  
  // Verificamos si el libro existe en nuestra base de datos
  if (books[isbn]) {
    // Devolvemos solo la propiedad 'reviews' del libro encontrado
    res.send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    // Si el ISBN no existe, enviamos un error 404
    res.status(404).json({message: "No se encontró el libro para ese ISBN"});
  }
});

module.exports.general = public_users;
