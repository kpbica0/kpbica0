//Кнопка по клику на которую определеяется ваша позиция
const btnCurrentPosition = document.querySelector(".footer__btn");

//Контейнер в котором находятся карточки
const flagContainer = document.querySelector(".flags");

// Ключ API тестовый
// В дальнейшем лучше зарегистрироваться и получить свой ключ
// https://geocode.xyz/
const API_KEY = "1313977089914138472x18455";

// Слушатель событий на контейнере карточек
document.addEventListener("click", (e) => {
  //   Нахождение ближайшего элемента
  const flag = e.target.closest(".flag");

  //   Проверка на наличие класса который переворачивает карточку
  if (flag) {
    if (flag.classList.contains("active")) {
      //   Удаление класса
      flag.classList.remove("active");
    } else {
      //   Добавление класса
      flag.classList.add("active");

      // Выбираем все карточки и для каждого из них, если он не активный
      // класс убираем
      setTimeout(() => {
        // получаем массив карточек по классу
        flagContainer.querySelectorAll(".flag").forEach((item) => {
          // Проверяем на наличие класса
          if (item.classList.contains("active") && item !== flag) {
            // Удаление класса
            item.classList.remove("active");
          }
        });
      }, 300);
    }
  } else {
    // Убираем класс у всех карточек
    flagContainer.querySelectorAll(".flag").forEach((item) => {
      item.classList.remove("active");
    });
  }
});

// Слушатель событий на кнопке определения позиции 'Где я?'
btnCurrentPosition.addEventListener("click", () => {
  // Получение текущей позиции
  navigator.geolocation.getCurrentPosition((position) => {
    // Деструктуризация координат
    const { latitude, longitude } = position.coords;
    if (!latitude || !longitude) {
      const latitude = 55.751;
      const longitude = 37.617;
      getCurrentCityByGPS(latitude, longitude);
    } else {
      getCurrentCityByGPS(latitude, longitude);
    }
  });
});

// функция определения города по GPS которая была в лекции
async function getCurrentPositionByGPS(latitude, longitude) {
  const response = await fetch(
    // добавляем ширину и долготу и ключ API
    `https://geocode.xyz/${latitude},${longitude}?geoit=json&auth=${API_KEY}`
  );
  // Проверям ответ
  // Если не 200 статус, выкидываем ошибку
  if (!response.ok) {
    throw new Error("Не удалось определить местоположение");
  }
  // Деструктуризация данных чтобы с большого объекта достать нужные поля
  // Таким образом избегаем бойлерплейта
  const { country } = await response.json();

  // Передаем страну в функцию
  getCountryByData(country);
}


// Пример запроса с помощью ключевого слово then
const getCountryByData = (country) => {
  flagContainer.innerHTML = "";
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then((response) => response.json())
    .then((data) => {
      renderCountryInDom(data[0]);
      return data;
    })
    .then((data) => {
      // Проверяем есть ли соседние страны
      if (data[0].borders.length > 0) {
        return Promise.all(
          // Делаем циклом сразу несколько запросов и ждем пока все они выполнятся
          data[0].borders.map((border) => {
            return fetch(`https://restcountries.com/v3.1/alpha/${border}`)
              .then((response) => response.json())
              .then((data) => data[0]);
          })
        );
      }
    })
    .then((data) => {
      if (data) {
        // Рендерим соседние страны в дом дерево
        data.forEach((item) => {
          renderCountryInDom(item, true);
        });
      }
    })
    .catch((error) => console.error("Не удалось определить местоположение", error));
};

// рендерим список городов в дом дереве
function renderCountryInDom(data, neighbour = false) {
  // Деструктуризация данных, достаем нужные поля
  const { name, region, population, languages, currencies, flags } = data;

  // Перевод населения в миллионы
  const populationInMillion = population / 10000000;

  // Преобразуем объект в массив значений
  const languagesArr = Object.values(languages);

  // Создаем HTML разметку
  // Если соседняя страна, добавляем класс flag-neighbour
  const html = `<div class="flag ${neighbour ? "flag-neighbour" : ""}">
        <div class="flag__front">
          <img class="flag__img" src="${flags.png}" />
          <h3 class="country__name">${name.common}</h3>
        </div>
        <div class="flag__back">
          <h3 class="country__name">${name.common}</h3>
          <h4 class="country__region">${region}</h4>
          <div class="country__info-img">&#128106;</div>
          <p class="country__info">${populationInMillion.toFixed(2)} million</p>
          <div class="country__info-img">&#128539;</div>
          <p class="country__info">${languagesArr.join("<br/>")}</p>
          <div class="country__info-img">&#128181;</div>
          <p class="country__info">${Object.values(currencies)
            .map((item) => `${item.symbol}: ${item.name}`)
            .join("<br/>")}</p>
        </div>
      </div>`;

  // Вставляем карточку c информацией в дом дерево
  flagContainer.insertAdjacentHTML("beforeend", html);
}

// Вызываем функцию которая определяет вашу позицию
// У меня api определения местоположения не работает 
// Поэтому я прокинул параметры
// Вы можете попробовать их убрать и проверить будет ли работать у вас
getCurrentPositionByGPS(55.751, 37.617);
