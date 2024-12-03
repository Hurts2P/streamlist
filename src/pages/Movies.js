import React, { useState, useEffect, useCallback } from 'react';
import TMDB_CONFIG from '../config/tmdb.config';
import './Movies.css';

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchCache, setSearchCache] = useState(() => {
    const cached = localStorage.getItem('tmdb-search-cache');
    return cached ? JSON.parse(cached) : {};
  });

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle search
  const handleSearch = useCallback(async (query) => {
    if (query.trim() === '') {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Check if offline and use cache
    if (isOffline) {
      const cachedResults = searchCache[query.toLowerCase()];
      if (cachedResults) {
        setSearchResults(cachedResults);
        setLoading(false);
        return;
      } else {
        setError('No cached results found for this search');
        setSearchResults([]);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(
        `${TMDB_CONFIG.API_URL}/search/movie?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
        // Update cache
        const updatedCache = {
          ...searchCache,
          [query.toLowerCase()]: data.results
        };
        setSearchCache(updatedCache);
        localStorage.setItem('tmdb-search-cache', JSON.stringify(updatedCache));
        setError(null);
      } else {
        setSearchResults([]);
        setError('No movies found');
      }
    } catch (err) {
      console.error('Search Error:', err);
      // Try to use cached results if available
      const cachedResults = searchCache[query.toLowerCase()];
      if (cachedResults) {
        setSearchResults(cachedResults);
        setError(null);
      } else {
        setError('Search failed. Please try again.');
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isOffline, searchCache]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim() === '') {
      setSearchResults([]);
      setError(null);
    }
  };

  // Initial movies fetch
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${TMDB_CONFIG.API_URL}/movie/popular?api_key=${TMDB_CONFIG.API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }
        
        const data = await response.json();
        setMovies(data.results);
        localStorage.setItem('tmdb-popular-movies', JSON.stringify(data.results));
      } catch (err) {
        console.error('Fetch Error:', err);
        const cachedMovies = localStorage.getItem('tmdb-popular-movies');
        if (cachedMovies) {
          setMovies(JSON.parse(cachedMovies));
        } else {
          setError('Failed to load movies');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  return (
    <div className={`movies-container ${isOffline ? 'offline' : ''}`}>
      {isOffline && (
        <div className="offline-notice">
          You are currently offline. Showing cached movies and search results.
        </div>
      )}

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={handleInputChange}
        />
      </div>

      {loading && <div className="movies-loading">Loading...</div>}
      
      {error && !loading && (searchQuery ? searchResults.length === 0 : movies.length === 0) && (
        <div className="movies-error">{error}</div>
      )}

      <div className="movies-grid">
        {(searchQuery ? searchResults : movies).map(movie => (
          <div key={movie.id} className="movie-card">
            <img 
              src={`${TMDB_CONFIG.IMAGE_BASE_URL}${TMDB_CONFIG.POSTER_SIZE}${movie.poster_path}`}
              alt={movie.title}
              onError={(e) => {
                e.target.src = 'placeholder-image.jpg';
              }}
            />
            <h3>{movie.title}</h3>
            <p>{movie.release_date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Movies;