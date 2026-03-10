const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Filtrar el array de usuarios para ver si el nombre ya existe
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => {
    // Comprobar si el nombre de usuario y la contraseña coinciden con los registros
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // 1. Validar que se proporcionen ambos campos
  if (!username || !password) {
      return res.status(404).json({ message: "Error al iniciar sesión: faltan credenciales" });
  }

  // 2. Autenticar al usuario (verificar si existe en el array 'users')
  if (authenticatedUser(username, password)) {
      // 3. Generar el JWT Access Token
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });

      // 4. Guardar el token y el nombre de usuario en la sesión
      req.session.authorization = {
          accessToken, username
      };
      
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Login inválido. Revisa tu usuario y contraseña" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let review = req.query.review; // Se obtiene de la URL (?review=texto)
    let username = req.session.authorization['username']; // Usuario de la sesión
  
    if (books[isbn]) {
        let book = books[isbn];
        // Si el usuario ya tiene una reseña, se sobreescribe. 
        // Si no, se añade una nueva bajo su nombre de usuario.
        book.reviews[username] = review;
        return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
    } else {
        return res.status(404).json({message: "Book not found"});
    }
  });

// delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username'];
  
    if (books[isbn]) {
        let book = books[isbn];
        // Verificamos si el usuario tiene una reseña en este libro
        if (book.reviews[username]) {
            delete book.reviews[username]; // Eliminamos solo la reseña de este usuario
            return res.status(200).send(`Review for ISBN ${isbn} by user ${username} deleted.`);
        } else {
            return res.status(404).json({message: "No review found for this user on this book."});
        }
    } else {
        return res.status(404).json({message: "Book not found"});
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
