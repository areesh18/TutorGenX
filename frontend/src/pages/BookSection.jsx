import React, { useState } from 'react';
import axios from 'axios';
import { Search, BookOpen, Calendar, User, Filter, Grid, List, Download } from 'lucide-react';

// Define the Book and BookSearchResponse types for clarity
/**
 * @typedef {Object} Book
 * @property {string} title
 * @property {string[]} author_name
 * @property {number} first_publish_year
 * @property {string} key
 * @property {string} [download_url]
 */

/**
 * @typedef {Object} BookSearchResponse
 * @property {Book[]} books
 */

const BookSearchComponent = () => {
  const [topic, setTopic] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');

  const fetchBooks = async (searchTopic) => {
    setLoading(true);
    setError(null);
    setBooks([]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      // Use axios and the correct endpoint from the backend logic
      const response = await axios.post(
        'http://localhost:8080/booksection', // Corrected endpoint to match the backend
        { topic: searchTopic },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      // Cast the response data to the defined type
      const data = response.data;
      if (data && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      // More specific error handling for a better user experience
      if (err.response) {
        setError(err.response.data.message || 'An error occurred on the server. Please check the backend.');
      } else if (err.request) {
        setError('No response from the server. The backend might not be running or is unreachable.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (topic.trim() !== '') {
      fetchBooks(topic);
    }
  };

  const handleTopicSelect = (selectedTopic) => {
    setTopic(selectedTopic);
    fetchBooks(selectedTopic);
  };

  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case 'year':
        return (b.first_publish_year || 0) - (a.first_publish_year || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author': {
        const authorA = a.author_name && a.author_name[0] ? a.author_name[0] : '';
        const authorB = b.author_name && b.author_name[0] ? b.author_name[0] : '';
        return authorA.localeCompare(authorB);
      }
      default:
        return 0;
    }
  });

  const BookCard = ({ book, isListView = false }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group ${
      isListView ? 'flex items-center p-4 space-x-6' : 'p-6'
    }`}>
      <div className={`${isListView ? 'flex-shrink-0' : 'mb-4'}`}>
        <div className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold ${
          isListView ? 'w-16 h-20 text-lg' : 'w-20 h-24 text-xl'
        }`}>
          <BookOpen className={isListView ? 'w-6 h-6' : 'w-8 h-8'} />
        </div>
      </div>

      <div className={`${isListView ? 'flex-grow min-w-0' : 'space-y-4'}`}>
        <div className={isListView ? 'flex justify-between items-start' : ''}>
          <div className={isListView ? 'min-w-0 flex-grow pr-4' : ''}>
            <h3 className={`font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-200 ${
              isListView ? 'text-lg mb-1 truncate' : 'text-xl mb-3'
            }`}>
              {book.title}
            </h3>
            
            <div className={`space-y-2 text-sm text-gray-600 ${isListView ? 'flex items-center space-y-0 space-x-4' : ''}`}>
              {book.author_name && book.author_name.length > 0 && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className={isListView ? 'truncate' : ''}>{book.author_name.join(', ')}</span>
                </div>
              )}
              
              {book.first_publish_year && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{book.first_publish_year}</span>
                </div>
              )}
            </div>
          </div>

          <div className={`${isListView ? 'flex-shrink-0' : 'pt-2'}`}>
            <a
              href={book.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-xl font-medium transition-all duration-200 border border-blue-100 hover:border-blue-200"
            >
              <Download className="w-4 h-4" />
              <span className={isListView ? 'hidden sm:inline' : ''}>Access Book</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-light text-gray-900 mb-4">Book Discovery</h1>
          <p className="text-gray-600 text-xl font-light max-w-lg mx-auto leading-relaxed">
            Explore thousands of free books from Internet Archive
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-white rounded-3xl p-2 shadow-xl border border-white">
              <div className="flex items-center">
                <Search className="ml-6 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  value={topic}
                  onChange={handleTopicChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  placeholder="Search for books on any topic..."
                  className="flex-1 px-4 py-4 text-lg bg-transparent focus:outline-none placeholder-gray-400"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !topic.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching</span>
                    </div>
                  ) : (
                    'Discover'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Results Header with Controls */}
        {books.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-3xl font-light text-gray-800 mb-2">
                  {books.length} Free Book{books.length !== 1 ? 's' : ''} Found
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort Controls */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="year">Newest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="author">Author A-Z</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid/List */}
            <div className={viewMode === 'grid' ? 
              'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 
              'space-y-4'
            }>
              {sortedBooks.map((book, index) => (
                <BookCard key={`${book.key}-${index}`} book={book} isListView={viewMode === 'list'} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {books.length === 0 && !loading && !error && topic && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-8">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">No books found</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              Try searching with different keywords or check your spelling
            </p>
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['machine learning', 'web development', 'data science', 'artificial intelligence'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleTopicSelect(suggestion)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {books.length === 0 && !loading && !error && !topic && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-8">
              <Search className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">Ready to explore?</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed mb-8">
              Search for books on any topic and discover free resources from Internet Archive
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { icon: '💻', label: 'Python', query: 'python programming' },
                { icon: '🌐', label: 'Web Dev', query: 'web development' },
                { icon: '📊', label: 'Data Science', query: 'data science' },
                { icon: '🧠', label: 'AI/ML', query: 'machine learning' }
              ].map((category) => (
                <button
                  key={category.label}
                  onClick={() => handleTopicSelect(category.query)}
                  className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {category.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-50 rounded-full mb-8">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">Searching for books...</h3>
            <p className="text-gray-600 text-lg">
              Exploring Internet Archive for the best matches
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSearchComponent;
