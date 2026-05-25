import z from "zod";

const GENRES = [
  "Terror",
  "Fantasía",
  "Ciencia Ficción",
  "Realismo Mágico",
  "Ensayo",
  "Misterio",
  "Novela",
  "Distopía",
];

const currentYear = new Date().getFullYear();

const bookSchema = z.object({
  title: z
    .string({
      invalid_type_error: "El titulo debe ser una cadena de texto",
      required_error: "El titulo es obligatorio",
    })
    .trim()
    .min(1, "El título no puede estar vacío")
    .max(100, "El título es demasiado largo para el sistema"),

  author: z
    .string({
      invalid_type_error: "El autor debe ser una cadena de texto",
      required_error: "El autor es obligatorio",
    })
    .trim()
    .min(3, "El nombre del autor debe tener al menos 3 caracteres")
    .max(100, "El nombre del autor es demasiado largo"),

  publication_year: z
    .number({
      required_error: "El año es obligatorio",
      invalid_type_error: "El año debe ser un número",
    })
    .int()
    .min(1440, "El año debe ser posterior a la invención de la imprenta")
    .max(currentYear, "El año no puede ser en el futuro"),

  genre: z
    .array(
      z.enum(GENRES, {
        invalid_type_error: "Uno de los géneros no es válido",
      }),
    )
    .min(1, "Debes poner al menos un género")
    .max(3, "No satures, máximo 3 géneros"),

  summary: z
    .string({
      invalid_type_error: "El resumen debe ser cadena de texto",
      required_error: "El resumen es obligatorio",
    })
    .trim()
    .min(10, "El resumen debe tener al menos 10 caracteres")
    .max(300, "El resumen es demasiado largo (máximo 300 caracteres)"),
});

export function validateBook(book) {
  return bookSchema.safeParse(book);
}

export function validationPartialBook(book) {
  return bookSchema.partial().safeParse(book);
}
