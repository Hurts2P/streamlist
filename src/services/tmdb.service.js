import TMDB_CONFIG from '../config/tmdb.config';

const headers = {
    'Authorization': `Bearer ${TMDB_CONFIG.ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
};

export const tmdbService = {
    async getPopularMovies() {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.API_URL}/movie/popular?language=en-US&page=1`,
                { headers }
            );
            if (!response.ok) throw new Error('Failed to fetch movies');
            return await response.json();
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            throw error;
        }
    },

    async searchMovies(query) {
        try {
            const response = await fetch(
                `${TMDB_CONFIG.API_URL}/search/movie?language=en-US&query=${encodeURIComponent(query)}&page=1`,
                { headers }
            );
            if (!response.ok) throw new Error('Search failed');
            return await response.json();
        } catch (error) {
            console.error('Error searching movies:', error);
            throw error;
        }
    }
}; 