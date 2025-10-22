const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const BOOKS_FILE = path.join(__dirname, 'books.json');

app.use(express.json());
app.use(express.static('.'));

// Helper function to read books from file
async function readBooks() {
  try {
    const data = await fs.readFile(BOOKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading books file:', error);
    return [];
  }
}

// Helper function to write books to file
async function writeBooks(books) {
  try {
    await fs.writeFile(BOOKS_FILE, JSON.stringify(books, null, 2));
  } catch (error) {
    console.error('Error writing books file:', error);
    throw error;
  }
}

// GET /books - return all books
app.get('/books', async (req, res) => {
  try {
    const books = await readBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /books/available - return only available books
app.get('/books/available', async (req, res) => {
  try {
    const books = await readBooks();
    const availableBooks = books.filter(book => book.available);
    res.json(availableBooks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /books - add a new book
app.post('/books', async (req, res) => {
  try {
    const { title, author, available } = req.body;
    if (!title || !author || available === undefined) {
      return res.status(400).json({ error: 'Title, author, and available are required' });
    }

    const books = await readBooks();
    const newId = books.length > 0 ? Math.max(...books.map(book => book.id)) + 1 : 1;
    const newBook = { id: newId, title, author, available };
    books.push(newBook);
    await writeBooks(books);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /books/:id - update a book
app.put('/books/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const { title, author, available } = req.body;
    const books = await readBooks();
    const bookIndex = books.findIndex(book => book.id === id);
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (title !== undefined) books[bookIndex].title = title;
    if (author !== undefined) books[bookIndex].author = author;
    if (available !== undefined) books[bookIndex].available = available;

    await writeBooks(books);
    res.json(books[bookIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /books/:id - delete a book
app.delete('/books/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const books = await readBooks();
    const bookIndex = books.findIndex(book => book.id === id);
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const deletedBook = books.splice(bookIndex, 1)[0];
    await writeBooks(books);
    res.json(deletedBook);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
