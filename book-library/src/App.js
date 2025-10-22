import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', available: true });
  const [editBook, setEditBook] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:3000';

  useEffect(() => {
    fetchBooks();
    fetchAvailableBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/books`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchAvailableBooks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/books/available`);
      setAvailableBooks(response.data);
    } catch (error) {
      console.error('Error fetching available books:', error);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/books`, newBook);
      setNewBook({ title: '', author: '', available: true });
      fetchBooks();
      fetchAvailableBooks();
    } catch (error) {
      console.error('Error adding book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    if (!editBook) return;
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/books/${editBook.id}`, editBook);
      setEditBook(null);
      fetchBooks();
      fetchAvailableBooks();
    } catch (error) {
      console.error('Error updating book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/books/${id}`);
      fetchBooks();
      fetchAvailableBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Book Library Management</h1>

      <div className="section">
        <h2>All Books</h2>
        <ul className="book-list">
          {books.map(book => (
            <li key={book.id} className="book-item">
              <span>{book.title} by {book.author} - {book.available ? 'Available' : 'Not Available'}</span>
              <div>
                <button onClick={() => setEditBook(book)}>Edit</button>
                <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>Available Books</h2>
        <ul className="book-list">
          {availableBooks.map(book => (
            <li key={book.id} className="book-item">
              {book.title} by {book.author}
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>Add New Book</h2>
        <form onSubmit={handleAddBook}>
          <input
            type="text"
            placeholder="Title"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={newBook.available}
              onChange={(e) => setNewBook({ ...newBook, available: e.target.checked })}
            />
            Available
          </label>
          <button type="submit" disabled={loading}>Add Book</button>
        </form>
      </div>

      {editBook && (
        <div className="section">
          <h2>Edit Book</h2>
          <form onSubmit={handleUpdateBook}>
            <input
              type="text"
              placeholder="Title"
              value={editBook.title}
              onChange={(e) => setEditBook({ ...editBook, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Author"
              value={editBook.author}
              onChange={(e) => setEditBook({ ...editBook, author: e.target.value })}
              required
            />
            <label>
              <input
                type="checkbox"
                checked={editBook.available}
                onChange={(e) => setEditBook({ ...editBook, available: e.target.checked })}
              />
              Available
            </label>
            <button type="submit" disabled={loading}>Update Book</button>
            <button type="button" onClick={() => setEditBook(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
