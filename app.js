const countryContainer = document.getElementById('country-container');
const favoritesContainer = document.getElementById('favorites-container');
const favoritesList = document.getElementById('favorites-list');
const searchInput = document.getElementById('search');
const regionFilter = document.getElementById('region-filter');
const showMoreButton = document.getElementById('show-more');

let countries = [];
let currentPage = 0;
const pageSize = 8; 
const fetchCountries = async () => {
    const response = await fetch('https://restcountries.com/v3.1/all');
    countries = await response.json();
    renderCountries();
};

const renderCountries = (filteredCountries = countries) => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    const paginatedCountries = filteredCountries.slice(start, end);

    if (currentPage === 0) {
        countryContainer.innerHTML = ''; 
    }

    paginatedCountries.forEach(country => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFavorite = favorites.includes(country.name.common);
        const favoriteButtonText = isFavorite ? 'Added to Favorites' : 'Favorite';

        const card = document.createElement('div');
        card.className = 'country-card';
        card.innerHTML = `
            <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
            <h3>${country.name.common}</h3>
            <button onclick="toggleFavorite('${country.name.common}', this)">${favoriteButtonText}</button>
            <button onclick="showDetails('${country.name.common}')">Details</button>
        `;
        countryContainer.appendChild(card);
    });

    currentPage++;
    showMoreButton.style.display = currentPage * pageSize < filteredCountries.length ? 'block' : 'none';

    if (currentPage > 1) {
        countryContainer.scrollIntoView({ behavior: 'smooth' });
    }
};

const toggleFavorite = (countryName, button) => {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (favorites.includes(countryName)) {
        favorites = favorites.filter(name => name !== countryName);
        button.textContent = 'Favorite';
    } else {
        if (favorites.length < 20) {
            favorites.push(countryName);
            button.textContent = 'Added to Favorites';
        } else {
            alert('You can only save up to 20 favorites!');
        }
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
};

const showFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesList.innerHTML = ''; 
    countryContainer.style.display = 'none'; 
    favoritesContainer.style.display = 'block';

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>No favorites added yet.</p>';
        return;
    }
    
    favorites.forEach(favorite => {
        const country = countries.find(c => c.name.common === favorite);
        if (country) {
            const card = document.createElement('div');
            card.className = 'country-card';
            card.innerHTML = `
                <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
                <h3>${country.name.common}</h3>
                <button onclick="removeFavorite('${country.name.common}')">Remove from Favorites</button>
                <button onclick="showDetails('${country.name.common}')">Details</button>
            `;
            favoritesList.appendChild(card);
        }
    });
};


const removeFavorite = (countryName) => {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(name => name !== countryName);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showFavorites(); 
};


const showDetails = (countryName) => {
    const country = countries.find(c => c.name.common === countryName);
    if (!country) return;

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorite = favorites.includes(country.name.common);

    const detailsPage = `
        <div class="details">
            <h2>${country.name.common}</h2>
            <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
            <p>Top Level Domain: ${country.tld[0]}</p>
            <p>Capital: ${country.capital[0]}</p>
            <p>Region: ${country.region}</p>
            <p>Population: ${country.population}</p>
            <p>Area: ${country.area} km²</p>
            <p>Languages: ${Object.values(country.languages).join(', ')}</p>
            <p>Status: ${isFavorite ? 'Added to Favorites' : 'Not in Favorites'}</p>
            <button onclick="goBack()">Back</button>
        </div>
    `;

    countryContainer.innerHTML = detailsPage;
    countryContainer.style.display = 'block';
    favoritesContainer.style.display = 'none'; 
};

const goBack = () => {
    favoritesContainer.style.display = 'none'; 
    countryContainer.style.display = 'block'; 
    currentPage = 0; 
    renderCountries(); 
};

fetchCountries();
regionFilter.addEventListener('change', () => {
    const selectedRegion = regionFilter.value;
    currentPage = 0; 
    const filteredCountries = selectedRegion
        ? countries.filter(country => country.region === selectedRegion)
        : countries;
    renderCountries(filteredCountries);
});

showMoreButton.addEventListener('click', () => {
    const filteredCountries = regionFilter.value 
        ? countries.filter(country => country.region === regionFilter.value)
        : countries;
    renderCountries(filteredCountries);
});
document.getElementById('favorites-link').addEventListener('click', (event) => {
    event.preventDefault();
    showFavorites();
});

document.getElementById('back-button').addEventListener('click', (event) => {
    event.preventDefault();
    goBack();
});

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filteredCountries = countries.filter(country => country.name.common.toLowerCase().includes(query));
    currentPage = 0; 
    renderCountries(filteredCountries);
});

