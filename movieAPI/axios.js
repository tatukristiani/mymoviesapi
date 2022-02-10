import axios from 'axios';

// Base URL for the TMDB API
export default axios.create({
    baseURL: "https://api.themoviedb.org/3/"
});