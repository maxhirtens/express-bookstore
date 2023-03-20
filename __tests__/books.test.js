// test for books route
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

// isbn of sample book
let book_isbn;

beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '87654321',
        'https://google.com',
        'Max',
        'English',
        160,
        'Kagge Forlag',
        'BOOK', 2023)
      RETURNING isbn`);

  book_isbn = result.rows[0].isbn;
});

describe("POST /books", function () {
  test("Creates a new book", async function () {
    const response = await request(app).post(`/books`).send({
      isbn: "12345678",
      amazon_url: "https://google.com",
      author: "Jojo",
      language: "english",
      pages: 13,
      publisher: "doodles",
      title: "lorem ipsum",
      year: 2025,
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.book).toHaveProperty("isbn");
  });

  test("Prevents creating book without required title", async function () {
    const response = await request(app).post(`/books`).send({ year: 2000 });
    expect(response.statusCode).toBe(500);
  });
});

afterEach(async function () {
  await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
  await db.end();
});
