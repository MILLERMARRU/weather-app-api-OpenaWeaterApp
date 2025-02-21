const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");

const notFoundSection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");
const weatherInfoSection = document.querySelector(".weather-info");

const countryTxt = document.querySelector(".country-txt");
const temTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");

const forecastItemsContainer = document.querySelector(
  ".forecast-items-container"
);

const apikey = CONFIG.API_KEY;

const notyf = new Notyf({
  duration: 3000,
  position: {
    x: "right",
    y: "top",
  },
});

searchBtn.addEventListener("click", () => {
  const city = cityInput.value;

  if (city.trim() != "") {
    updateWeatherInfo(cityInput.value);
    city = "";
    cityInput.blur();
  } else {
    notyf.error({
      message: "El nombre de la ciudad no puede estar vacío",
      background: "#CBA16D",
    });
  }
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();

    if (city === "") {
      notyf.error({
        message: "El nombre de la ciudad no puede estar vacío",
        background: "#CBA16D"
      });
    } else {
      updateWeatherInfo(city);
      cityInput.value = "";
      cityInput.blur();
    }
  }
});

async function getFetchData(endPoint, city) {
  const url = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apikey}&units=metric`;

  const response = await fetch(url);

  return response.json();
}

function getWeatherImg(id) {
  if (id <= 232) return "thunderstorm.svg";
  if (id <= 321) return "drizzle.svg";
  if (id <= 531) return "rain.svg";
  if (id <= 622) return "snow.svg";
  if (id <= 781) return "atmosphere.svg";
  if (id === 800) return "clear.svg";
  else return "clouds.svg";
}

async function updateWeatherInfo(city) {
  const weatherData = await getFetchData("weather", city);
  /* console.log(weatherSata); */

  if (weatherData.cod != 200) {
    ShowDisplaySection(notFoundSection);
    return;
  }

  console.log(weatherData);

  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;

  countryTxt.textContent = country;
  temTxt.textContent = `${Math.round(temp)} °C`;
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = `${humidity}%`;
  windValueTxt.textContent = `${speed} M/s`;

  currentDateTxt.textContent = new Date().toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  weatherSummaryImg.src = `assets/weather/${getWeatherImg(id)}`;

  await updtaeForecastInfo(city);

  ShowDisplaySection(weatherInfoSection);
}

async function updtaeForecastInfo(city) {
  const forecastData = await getFetchData("forecast", city);

  const timeTaken = "12:00:00";
  forecastItemsContainer.innerHTML = "";

  const todayDate = new Date().toISOString().split("T")[0];

  forecastData.list.forEach((forecastWeather) => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) &&
      !forecastWeather.dt_txt.includes(todayDate)
    ) {
      updateForecstItems(forecastWeather);
      //console.log(forecastWeather);
    }
  });
}

function updateForecstItems(weatherData) {
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp },
  } = weatherData;

  const dateTaken = new Date(date);
  const dateOptions = { day: "2-digit", month: "short" };

  const dateResult = dateTaken.toLocaleDateString("es-ES", dateOptions);

  const forecastItem = `
    <div class="forecast-item">
        <h5 class="forecast-item-date regular">
            ${dateResult}
        </h5>
        <img src="assets/weather/${getWeatherImg(id)} " class="forecast-item-img">
        <h5 class="forecast-item-temp">
            ${Math.round(temp)} °C
        </h5>
    </div>`;

    forecastItemsContainer.insertAdjacentHTML("beforeend", forecastItem);
}

function ShowDisplaySection(section) {
  [notFoundSection, searchCitySection, weatherInfoSection].forEach(
    (section) => {
      section.style.display = "none";
    }
  );

  section.style.display = "flex";
}
