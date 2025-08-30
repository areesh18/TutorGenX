import React, { useState } from 'react';
import { Search, BookOpen, Calendar, User, ExternalLink } from 'lucide-react';

const BookSearchComponent = () => {
  const [topic, setTopic] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    setBooks([]);

    try {
      // Get the JWT token from local storage or a secure location
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      // Make the POST request to the backend with the topic
      const response = await fetch('http://localhost:8080/booksection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      if (err.response) {
        setError(err.response.data || 'An error occurred on the server.');
      } else if (err.request) {
        setError('No response from the server. Please check the backend.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (topic.trim() !== '') {
      fetchBooks();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-light text-gray-900 mb-4">Discover Books</h1>
          <p className="text-gray-600 text-lg font-light max-w-md mx-auto">
            Find your next great read with intelligent book recommendations
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={topic}
                onChange={handleTopicChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="What would you like to read about?"
                className="w-full pl-12 pr-32 py-4 text-lg bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !topic.trim()}
                className="absolute right-2 top-2 bottom-2 px-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching</span>
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl">
              {error}
            </div>
          </div>
        )}

        {/* Results */}
        {books.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-light text-gray-800 mb-2">
                Found {books.length} book{books.length !== 1 ? 's' : ''}
              </h2>
              <div className="w-12 h-0.5 bg-blue-600 mx-auto"></div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {books.map((book, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 group">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors duration-200">
                        {book.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {book.author_name && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{book.author_name.join(', ')}</span>
                          </div>
                        )}
                        
                        {book.first_publish_year && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{book.first_publish_year}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href={book.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                      >
                        <span>View Book</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {books.length === 0 && !loading && !error && topic && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">Try searching with different keywords or topics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSearchComponent;