const TMDB_CONFIG = {
    API_URL: "https://api.themoviedb.org/3",
    API_KEY: process.env.REACT_APP_TMDB_API_KEY,
    ACCESS_TOKEN: process.env.REACT_APP_TMDB_ACCESS_TOKEN,
    IMAGE_BASE_URL: "https://image.tmdb.org/t/p/",
    BACKDROP_SIZE: "w1280",
    POSTER_SIZE: "w500"
};

export default TMDB_CONFIG; 