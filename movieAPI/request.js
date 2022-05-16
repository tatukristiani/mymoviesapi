const API_KEY = process.env.API_KEY;
const BASE_URL = `https://api.themoviedb.org/3`;

/* Action code = 28, Comedy code = 35, Horror code = 27, Romance code = 10749, Docs code 99*/

const requests = {
    fetchTrending: BASE_URL + `/trending/movie/week?api_key=${API_KEY}&language=en-US&page=`,
    fetchTopRated: BASE_URL + `/movie/top_rated?api_key=${API_KEY}&language=en-US`,
    fetchMoviesByGenre: BASE_URL + `/discover/movie?api_key=${API_KEY}&with_genres=`, // Add genre code to end.
    search: BASE_URL + `/search/movie?api_key=${API_KEY}&query=`
}

module.exports = requests;
