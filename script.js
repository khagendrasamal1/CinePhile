// TMDb API key and Base URL
const API_KEY = 'ac25e04e9751a85e9d63d646f4de8db4';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

let selectedMovieId = null;  // Store selected movie ID

// Function to fetch top 10 movies by genre
async function getTopMoviesByGenre(genreId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.results.slice(0, 10); // Top 10 movies
    } catch (error) {
        console.error('Error fetching top movies:', error);
        return [];
    }
}

// Function to fetch movie suggestions based on user input
async function searchMovies(query) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
}

// Function to fetch recommendations based on the selected movie ID
async function getRecommendations(movieId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.results.slice(0, 5); // Top 5 recommended movies
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}

// Function to fetch movie details including the trailer and cast
async function getMovieDetails(movieId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

// Function to display top 10 movies by genre
async function displayMovies(genreId) {
    const movies = await getTopMoviesByGenre(genreId);
    const carousel = document.querySelector('.carousel');
    carousel.innerHTML = '';

    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('carousel-item');
        movieDiv.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
        `;
        carousel.appendChild(movieDiv);
    });
}

// Event listener for genre selection change
document.getElementById('genreSelect').addEventListener('change', (event) => {
    const selectedGenre = event.target.value;
    displayMovies(selectedGenre);
});

// Event listener for movie search
document.getElementById('movieSearch').addEventListener('input', async (event) => {
    const query = event.target.value.trim();
    const resultsContainer = document.querySelector('.search-results');

    if (query.length > 0) {
        const results = await searchMovies(query);
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'block';

        results.forEach(result => {
            const resultDiv = document.createElement('div');
            resultDiv.classList.add('result-item');
            resultDiv.innerText = result.title;
            resultDiv.addEventListener('click', () => {
                selectedMovieId = result.id;
                document.getElementById('movieSearch').value = result.title;
                resultsContainer.style.display = 'none';
                document.getElementById('recommendBtn').style.display = 'block'; // Show Recommend button
            });
            resultsContainer.appendChild(resultDiv);
        });
    } else {
        resultsContainer.style.display = 'none';
    }
});

// Event listener for getting recommendations
document.getElementById('recommendBtn').addEventListener('click', async () => {
    const recommendationsContainer = document.querySelector('.recommendations');
    recommendationsContainer.innerHTML = '';

    const recommendations = await getRecommendations(selectedMovieId);
    for (const movie of recommendations) {
        const movieDetails = await getMovieDetails(movie.id);
        if (movieDetails) {
            const castNames = movieDetails.credits.cast.slice(0, 3).map(castMember => castMember.name).join(', ');
            const trailer = movieDetails.videos.results.find(video => video.type === 'Trailer');
            const imdbRating = movieDetails.vote_average.toFixed(1);  // IMDb rating (rounded to 1 decimal place)
            const releaseDate = movieDetails.release_date;  // Movie release date

            const movieDiv = document.createElement('div');
            movieDiv.classList.add('recommendation-item');
            movieDiv.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" style="width: 150px;">
                <h3>${movie.title}</h3>
                <p><strong>IMDb Rating:</strong> ${imdbRating}</p>
                <p><strong>Release Date:</strong> ${releaseDate}</p>
                <p><strong>Cast:</strong> ${castNames}</p>
                <p><strong>Trailer:</strong> ${trailer ? `<a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank">Watch here</a>` : 'No trailer available'}</p>
            `;
            recommendationsContainer.appendChild(movieDiv);

            // Add a divider after each recommendation, except the last one
            const divider = document.createElement('div');
            divider.classList.add('recommendation-divider');
            divider.style.borderTop = "1px solid #ccc";
            divider.style.margin = "10px 0";
            recommendationsContainer.appendChild(divider);
        }
    }
});

// Initial display of movies when page loads
document.addEventListener('DOMContentLoaded', () => {
    displayMovies(28);  // Default genre: Action
});


// Function to fetch trending movies by streaming platform
async function getTrendingMovies(platform) {
    let platformId;

    switch (platform) {
        case 'netflix':
            platformId = '8'; // TMDB ID for Netflix
            break;
        case 'amazon-prime':
            platformId = '9'; // TMDB ID for Amazon Prime
            break;
        case 'hulu':
            platformId = '15'; // TMDB ID for Hulu
            break;
        case 'disney-plus':
            platformId = '337'; // TMDB ID for Disney+
            break;
        case 'apple-tv':
            platformId = '350'; // TMDB ID for Apple TV+
            break;
        case 'peacock':
            platformId = '386'; // TMDB ID for Peacock
            break;
        case 'paramount':
            platformId = '531'; // TMDB ID for Paramount+
            break;
        case 'starz':
            platformId = '43'; // TMDB ID for Starz
            break;
        default:
            platformId = '213'; // Default to Netflix
    }

    const response = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&with_watch_providers=${platformId}&watch_region=US&sort_by=popularity.desc`);
    const data = await response.json();
    return data.results.slice(0, 10); // Top 10 trending movies
}


// Function to display trending movies in a carousel
async function displayTrendingMovies(platform) {
    const movies = await getTrendingMovies(platform);
    const carousel = document.getElementById('trendingCarousel');
    carousel.innerHTML = '';

    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('carousel-item');
        movieDiv.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
        `;
        carousel.appendChild(movieDiv);
    });
}

// Event listener for platform selection change
document.getElementById('platformSelect').addEventListener('change', (event) => {
    const selectedPlatform = event.target.value;
    displayTrendingMovies(selectedPlatform);
});

// Initial display of trending movies for Netflix when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayTrendingMovies('netflix'); // Default platform: Netflix
});


// Function to fetch trending web series by streaming platform
async function getTrendingWebSeries(platform) {
    let platformId;

    switch (platform) {
        case 'netflix':
            platformId = '8'; // TMDB ID for Netflix
            break;
        case 'amazon-prime':
            platformId = '9'; // TMDB ID for Amazon Prime
            break;
        case 'hulu':
            platformId = '15'; // TMDB ID for Hulu
            break;
        case 'disney-plus':
            platformId = '337'; // TMDB ID for Disney+
            break;
        case 'apple-tv':
            platformId = '350'; // TMDB ID for Apple TV+
            break;
        case 'peacock':
            platformId = '386'; // TMDB ID for Peacock
            break;
        case 'paramount':
            platformId = '531'; // TMDB ID for Paramount+
            break;
        case 'starz':
            platformId = '43'; // TMDB ID for Starz
            break;
        default:
            platformId = '8'; // Default to Netflix
    }

    const response = await fetch(`${TMDB_BASE_URL}/discover/tv?api_key=${API_KEY}&with_watch_providers=${platformId}&watch_region=US&sort_by=popularity.desc`);
    const data = await response.json();
    return data.results.slice(0, 10); // Top 10 trending web series
}

// Function to display trending web series based on selected platform
async function displayTrendingWebSeries(platform) {
    const webSeries = await getTrendingWebSeries(platform);
    const carousel = document.getElementById('trendingWebSeriesCarousel');
    carousel.innerHTML = '';

    webSeries.forEach(series => {
        const seriesDiv = document.createElement('div');
        seriesDiv.classList.add('carousel-item');
        seriesDiv.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${series.poster_path}" alt="${series.name}">
        `;
        carousel.appendChild(seriesDiv);
    });
}

// Event listener for platform selection change
document.getElementById('webSeriesPlatformSelect').addEventListener('change', (event) => {
    const selectedPlatform = event.target.value;
    displayTrendingWebSeries(selectedPlatform);
});

// Initial display of trending web series for default platform (Netflix)
document.addEventListener('DOMContentLoaded', () => {
    displayTrendingWebSeries('netflix'); // Default to Netflix
});
