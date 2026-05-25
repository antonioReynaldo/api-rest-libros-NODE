import booksData from "./data/books.json" with { type: "json" };
import { validateBook, validationPartialBook } from "./schemas/book.js";
import express from "express";
import crypto from "crypto";
import cors from "cors";

// Convertimos a una variable mutable para poder usar push/splice/etc.
let books = [...booksData];

// origenes permitidos
const ACCEPTED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://pelicffulas.com",
];

const app = express();
app.disable("x-powered-by");
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      // Si el origen está en la lista o es una petición local (sin origin, como Postman)
      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use((err, req, res, next) => {
  // Verificamos si el error viene del parseo de JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Bad Request",
      message: "El formato del JSON es inválido. Revisa comas o llaves.",
    });
  }
  // Si es otro tipo de error, se lo pasamos al manejador por defecto
  next();
});

// METODO GET (OBTENER TODOS LOS LIBROS O DE UN GENERO)
app.get("/books", (req, res) => {
  const { genre } = req.query;
  if (genre) {
    const filteredBooks = books.filter((book) =>
      book.genre.some((g) => g.toLowerCase() === genre.toLowerCase()),
    );
    return res.json(filteredBooks);
  }
  res.json(books);
});

// (OBTENER UN LIBRO EN ESPECIFICO)
app.get("/books/:id", (req, res) => {
  const { id } = req.params;
  const book = books.find((b) => b.id === id);
  if (!book) return res.status(404).json({ message: "Libro no encontrado" });
  res.json(book);
});

// METODO POST
app.post("/books", (req, res) => {
  const result = validateBook(req.body);

  if (!result.success) {
    return res.status(422).json({ error: result.error.flatten().fieldErrors });
  }

  const newBook = { id: crypto.randomUUID(), ...result.data };
  books.push(newBook);
  res.status(201).json(newBook);
});

// METODO PARA ELIMINAR (DELETE)
app.delete("/books/:id", (req, res) => {
  const { id } = req.params;

  const index = books.findIndex((book) => book.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  books.splice(index, 1);
  res.status(200).json({ message: "Libro eliminado exitosamente" });
});

// METODO PARA REEMPLAZAR UN RECURSO
app.put("/books/:id", (req, res) => {
  // validar que todos los campos esten
  const result = validateBook(req.body);

  if (!result.success) {
    return res.status(422).json({ error: result.error.flatten().fieldErrors });
  }

  const { id } = req.params;

  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  // Reemplazamos el recurso manteniendo su id
  const updateBook = {
    id, // Mandamos el mismo ID
    ...result.data, // Sobrescribimos TODO lo demás con los nuevos datos
  };

  books[index] = updateBook;

  res.json(updateBook);
});

// METODO PARA ACTUALIZAR UNA PARTE DE UN RECURSO
app.patch("/books/:id", (req, res) => {
  const result = validationPartialBook(req.body);

  if (!result.success) {
    return res.status(422).json({ error: result.error.flatten().fieldErrors });
  }

  const { id } = req.params;
  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  books[index] = { ...books[index], ...result.data };
  res.json(books[index]);
});

// Middleware para manejar rutas inexistentes (404 global)
app.use((req, res) => {
  res.status(404).json({ message: "Recurso no encontrado" });
});

// Elegimos el puerto
const PORT = process.env.PORT ?? 3000;
// Definimos el escuchador del puerto
app.listen(PORT, () => {
  console.log("El servidor esta corriendo en el puerto 3000");
});
