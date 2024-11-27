import React, { useState, useEffect } from 'react';
import TMDB_CONFIG from '../config/tmdb.config';
import { tmdbService } from '../services/tmdb.service';
import './Movies.css';

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Fetch popular movies on initial load
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await tmdbService.getPopularMovies();
        setMovies(data.results);
        localStorage.setItem('tmdb-movies', JSON.stringify(data.results));
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err.message);
        const cachedMovies = localStorage.getItem('tmdb-movies');
        if (cachedMovies) {
          setMovies(JSON.parse(cachedMovies));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Search functionality
  const searchMovies = async (query) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      const data = await tmdbService.searchMovies(query);
      setSearchResults(data.results);
      setIsSearching(true);
      localStorage.setItem('tmdb-search-results', JSON.stringify(data.results));
      localStorage.setItem('tmdb-last-search', query);
    } catch (err) {
      setError(err.message);
      const cachedResults = localStorage.getItem('tmdb-search-results');
      if (cachedResults) {
        setSearchResults(JSON.parse(cachedResults));
      }
    }
  };

  // Handle search input with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    const newTimeout = setTimeout(() => {
      searchMovies(query);
    }, 500); // Wait 500ms after user stops typing

    setSearchTimeout(newTimeout);
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  if (loading) return <div className="movies-loading">Loading...</div>;
  if (error) return <div className="movies-error">Error: {error}</div>;

  const displayedMovies = isSearching ? searchResults : movies;

  return (
    <div className="movies-container">
      <h1 className="movies-title">Movie Database</h1>
      
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for movies..."
          className="search-input"
          autoFocus
        />
      </div>

      <div className="movies-grid">
        {displayedMovies.map((movie) => (
          <div key={movie.id} className="movie-card">
            {movie.poster_path ? (
              <img
                src={`${TMDB_CONFIG.IMAGE_BASE_URL}${TMDB_CONFIG.POSTER_SIZE}${movie.poster_path}`}
                alt={movie.title}
                className="movie-poster"
              />
            ) : (
              <div className="movie-poster-placeholder">No Image Available</div>
            )}
            <div className="movie-info">
              <h3 className="movie-title">{movie.title}</h3>
              <p className="movie-rating">Rating: {movie.vote_average.toFixed(1)}/10</p>
              <p className="movie-release-date">
                Release: {new Date(movie.release_date).toLocaleDateString()}
              </p>
              <p className="movie-overview">{movie.overview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Movies;