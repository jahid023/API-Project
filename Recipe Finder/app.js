document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '213df765101346c9a76172659251405';
    const searchBtn = document.getElementById('search-btn');
    const locationInput = document.getElementById('location');
    const cityElement = document.getElementById('city');
    const tempElement = document.getElementById('temp');
    const conditionElement = document.getElementById('condition');
    const humidityElement = document.getElementById('humidity');
    const windElement = document.getElementById('wind');
    const weatherContainer = document.querySelector('.weather-container');

    // Function to fetch weather data
    async function fetchWeather(city) {
        try {
            // Show loading state
            weatherContainer.innerHTML = `
                <div class="loading"></div>
                <p>Fetching weather data...</p>
            `;
            weatherContainer.style.display = 'block';

            const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=yes`);
            
            if (!response.ok) {
                throw new Error('City not found');
            }
            
            const data = await response.json();
            displayWeather(data);
        } catch (error) {
            showError('Could not fetch weather data. Please try again.');
            console.error('Error fetching weather:', error);
        }
    }

    // Function to display weather data
    function displayWeather(data) {
        const { location, current } = data;
        
        cityElement.textContent = `${location.name}, ${location.country}`;
        tempElement.textContent = `${Math.round(current.temp_c)}°C`;
        conditionElement.textContent = current.condition.text;
        humidityElement.textContent = `${current.humidity}%`;
        windElement.textContent = `${current.wind_kph} km/h`;
        
        // Show weather info
        weatherContainer.innerHTML = `
            <div class="weather-info">
                <h2 id="city">${location.name}, ${location.country}</h2>
                <div class="temp" id="temp">${Math.round(current.temp_c)}°C</div>
                <div class="weather-details">
                    <div class="detail">
                        <span class="label">Condition</span>
                        <span id="condition">${current.condition.text}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Humidity</span>
                        <span id="humidity">${current.humidity}%</span>
                    </div>
                    <div class="detail">
                        <span class="label">Wind</span>
                        <span id="wind">${current.wind_kph} km/h</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Function to show error message
    function showError(message) {
        weatherContainer.innerHTML = `
            <div class="error">
                <p>${message}</p>
            </div>
        `;
    }

    // Event listeners
    searchBtn.addEventListener('click', () => {
        const location = locationInput.value.trim();
        if (location) {
            fetchWeather(location);
        }
    });

    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const location = locationInput.value.trim();
            if (location) {
                fetchWeather(location);
            }
        }
    });

    // Fetch weather for default location (London) on page load
    fetchWeather('London');
});
