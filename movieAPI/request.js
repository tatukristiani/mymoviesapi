const API_KEY  = "ac4ead2bbde49f3cb342413c09f6d25a";
const BASE_URL = "https://api.themoviedb.org/3"

const requests = {
    fetchTrending: BASE_URL + `/trending/movie/week?api_key=${API_KEY}&language=en-US`,
    fetchTopRated: BASE_URL + `/movie/top_rated?api_key=${API_KEY}&language=en-US`,
    fetchActionMovies: BASE_URL + `/discover/movie?api_key=${API_KEY}&with_genres=28`,
    fetchComedyMovies: BASE_URL + `/discover/movie?api_key=${API_KEY}&with_genres=35`,
    fetchHorrorMovies: BASE_URL + `/discover/movie?api_key=${API_KEY}&with_genres=27`,
    fetchRomanceMovies: BASE_URL + `/discover/movie?api_key=${API_KEY}&with_genres=10749`,
    fetchDocumentaries: BASE_URL + `/discover/movie?api_key=${API_KEY}&with_genres=99`,
    fetchPoster: "https://image.tmdb.org/t/p/original/"
}

export default requests;