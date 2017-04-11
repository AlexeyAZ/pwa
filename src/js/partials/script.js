;(function($) {
  $(function() {


      window.addEventListener('beforeinstallprompt', function(e) {
        // beforeinstallprompt Event fired
        console.log(1);
        // e.userChoice will return a Promise. 
        // For more details read: http://www.html5rocks.com/en/tutorials/es6/promises/
        e.userChoice.then(function(choiceResult) {

            console.log(choiceResult.outcome);

            if(choiceResult.outcome == 'dismissed') {
            console.log('User cancelled home screen install');
            }
            else {
            console.log('User added to home screen');
            }
        });
    });

    // service worker

    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/js/sw.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    }

    // Глобальные переменные

      // Теги и классы
      var body = $(document.body);
      var header = $("#header");
      var footer = $("#footer");
      var search = $("#search");
      var searchResults = $("#searchResults");
      var menu = $("#menu");
      var inputSize = $("#inputSize");
      var headerArrow = $("#headerArrow");

      // Навигация
      var weatherFolder;
      var mainPage = "main";
      var citiesListPage = "citiesList";
      var startHistoryLength;

      // Объекты и их настройки
      var fullCityesList = null;
      var fullIconsList = null;
      var defaultCityNumber = 3;

      // Локально или сервер
      var local = false;


    // Старт приложения
    start();


    // Функция старта
    function start() {
      isLocal();

      setHistoryState();
      setContentHeight();
      getCityesData();
    };


    // Проверка как открыт сайт - локально или на сервере

    function isLocal() {
      if (!local) {
        weatherFolder = "/local_sites/weatherapp/";
      } else {
        weatherFolder = "/";
      };
    };


    // Получить список городов
    function getCityesData() {
      $.ajax({

        url: weatherFolder + "cityes.json",
        beforeSend: function() {
          getWeatherIcons();
        },
        success: function(cityesData) {
          console.log("список городов загружен успешно");
          fullCityesList = cityesData;
        },
        error: function() {
          console.log("при загрузке списка городов произошла ошибка");
        },
        complete: function() {
          getWeatherData(defaultCityNumber);
          createFullCityesList(fullCityesList);
        }
      });
    };


    // ajax запрос на получение кода иконок
    function getWeatherIcons() {

      $.ajax({

        url: weatherFolder + "icons.json",
        success: function(weatherIcons) {
          console.log("список иконок загружен успешно");
          fullIconsList = weatherIcons;
        },
        error: function () {
          console.log("при загрузке списка иконок произошла ошибка");
        }
      });
    };


    // Ajax запрос на openweathermap
    function getWeatherData(cityNumber) {

      var cityId = fullCityesList[cityNumber].id;

      $.ajax({

        url: "http://api.openweathermap.org/data/2.5/forecast/daily?id=" + cityId + "&units=metric&lang=ru&callback=&APPID=4d53f546b1a3fa35fec27b8c8c0d4920",
        beforeSend: function() {
          setInputAttributes(cityNumber);
          spinAnimate();
        },
        success: function(dataWeather) {
          console.log("данные о погоде загружены успешно");
          //console.log(dataWeather);
          createCards(dataWeather);
        },
        error: function () {
          console.log("при загрузке данных о погоде произошла ошибка");
        },
        complete: function() {
          spinAnimate();
        }
      });
    };


    // Установить дополнительные атрибуты полю ввода
    function setInputAttributes(cityNumber) {
      var placeholderText = fullCityesList[cityNumber].nameRus;

      search.val("");
      search.attr("placeholder", placeholderText);
      search.attr("data-city-number", cityNumber);

      inputSize.text(placeholderText);
      var inputSizeLeft = inputSize.position().left;
      var inputSizeWidth = inputSize.width();
      var inputSizeOffset = inputSizeLeft + inputSizeWidth;
      headerArrow.css({"left": inputSizeOffset + 5});
      //headerArrow.show();
    };


    //Создать полный список городов
    function createFullCityesList(cityesData) {

      var searchResultsContainer = searchResults.find(".search-results__container");
      var cityesList =  '<ul class="search-results__list">'

      for (var i = 0; i < cityesData.length; i++) {
        cityesList += '<li class="search-results__element" data-city-number=' + i + '>' + cityesData[i].nameRus + '</li>';
      };

      cityesList += '</ul>';
      searchResultsContainer.html(cityesList);
    };


    // Создать карточки
    function createCards(dataWeather) {

      var numberCards = dataWeather.list.length;
      var cards = '<div class="container" id="cardsContainer">';
      var cardTemplate = $("#cardTemplate").html();
      var content = $("#content");

      for (var i = 0; i < numberCards; i++) {
        cards += cardTemplate;
      };

      cards += '</div>';
      content.html(cards);

      createCardData(numberCards, dataWeather);
    };


    // Создать контент для карточек
    function createCardData(numberCards, dataWeather) {

      for (var i = 0; i < numberCards; i++) {

        var card = $("#cardsContainer").find(".card").eq(i);

        // Дневная и ночная температура
        var dayTemp = setTempSign(Math.round(dataWeather.list[i].temp.day));
        var nightTemp = setTempSign(Math.round(dataWeather.list[i].temp.night));

        card.find(".card__temperature_day").text(dayTemp);
        card.find(".card__temperature_night").text(nightTemp);

        // Дата
        var time = timeConverter(dataWeather.list[i].dt);
        var weekday = time.weekday;
        var year = time.year;
        var month = time.month;
        var day = time.day;

        card.find(".card__weekday").text(weekday);
        card.find(".card__date").text(day + "." + month + "." + year);

        // Иконки
        var prefix = 'wi wi-';
        var code = dataWeather.list[i].weather[0].id;
        var icon = fullIconsList[code].icon;

        if (!(code > 699 && code < 800) && !(code > 899 && code < 1000)) {
          icon = 'day-' + icon;
        }

        icon = prefix + icon;
        card.find(".card__icon").addClass(icon);
      }
    };


    // Клик по элементу в списке городов
    $(".search-results__container").on("click", ".search-results__element", function() {

      var self = $(this);
      var cityesElementsList = searchResults.find(".search-results__element");

      sityListClick(self);

      // Сделать все города из списка видимыми через определенный интервал
      setTimeout(function(){
        cityesElementsList.each(function(){
          var self = $(this);
          if (self.css("display") == "none") {
            self.css("display", "list-item");
          }
        });
      }, 500);
    });


    function sityListClick(cityElem) {

      var cityNumber = cityElem.data("city-number");
      var cityName = fullCityesList[cityNumber].nameRus;
      var cityesList =  searchResults.find(".search-results__list");

      body.removeClass("search-active");
      history.replaceState(mainPage, null);
      getWeatherData(cityNumber);
    };


    // Клик по полю ввода города
    search.on("click", function(e) {
      var self = $(this);
      body.addClass("search-active");
      history.pushState(citiesListPage, null);
      console.log("cityElemClicklength: " + history.length);

      if(search.on("focus")) {
        findCity();
      };

      //headerArrow.hide();
    });


    // Клик вне списка городов закрывает список
    body.on("click", function(e) {

      var self = $(e.target);

      if (self.hasClass("search-results")) {
        body.removeClass("search-active");
        search.val("")
              .blur();
        history.replaceState(mainPage, null);
        console.log("missCityListlength: " + history.length);
      };

      if (!self.hasClass("menu__btn") && menu.hasClass("menu_active")) {
        menu.removeClass("menu_active");
      }
    });


    // Поиск города по набранному тексту
    function findCity() {

      search.keyup(function() {

        var self = $(this);
        var inputValue = self.val();
        var cityName;
        var cityesElementsList = searchResults.find(".search-results__element");

        for (var i = 0; i < cityesElementsList.length; i++) {

          cityName = cityesElementsList.eq(i).text();
          var inputValueLength = inputValue.length;

          if (cityName.toLowerCase().slice(0, inputValueLength) ==  inputValue) {

            cityesElementsList.eq(i).css("display", "list-item");
          } else {
            cityesElementsList.eq(i).css("display", "none");
          }
        }
      });
    };


    // Клик по кнопке меню
    menu.on("click", function(e){
      var self = $(e.target);

      if (self.is(".menu__btn") || self.closest(".menu__btn").length > 0) {
        if (menu.hasClass("menu_active")) {
          menu.removeClass("menu_active");
        } else {
          menu.addClass("menu_active");
        }
      };

      if (self.hasClass("menu__list-item_refresh")) {
        window.location.reload(true);
      };
    });


    // При загрузке сайта добавить в историю запись, о нахождении на главной странице
    function setHistoryState() {
      console.log("firstLoadHistoryLength: " + history.length);
      if (location.pathname == weatherFolder + "index.html" ||
          location.pathname == weatherFolder) {
        history.pushState(mainPage, null);
        startHistoryLength = history.length;
        console.log("afterFirstLoadlength: " + history.length);
      }
    };


    // Обработчик нажатия кнопок "вперед" и "назад"
    window.addEventListener('popstate', function(e) {
      console.log("beforePushBack: " + history.length);
      var historyLength = -(+history.length - startHistoryLength);
      console.log("afterPushBack: " + history.length);

      if (history.state == mainPage && body.hasClass("search-active")) {
        body.removeClass("search-active");
        search.val("")
              .blur();
        history.replaceState(mainPage, null);
      } else {
        history.go(historyLength);
        console.log("backButtonHisoryLength: " + history.length);
      }
    }, false);


    // Клик по кнопке обновить
    footer.on("click", "#refreshButton", function(){
      var refreshCityNumber = search.attr("data-city-number");
      getWeatherData(refreshCityNumber);
    });


    // Установить высоту контента, равную высоте окна браузера
    function setContentHeight() {
      var windowHeight = $(window).height();
      $("html").height(windowHeight);
    };


    // Переводит время из системы UNIX в UTC
    function timeConverter(UNIX_timestamp){
      var a = new Date(UNIX_timestamp * 1000);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var days = ["ВС","ПН","ВТ","СР","ЧТ","ПТ","СБ"];
      var year = a.getFullYear();
      var month = a.getMonth() + 1;

      if (("" + month).length == 1) {
        month = "0" + month;
      };

      var weekday = days[a.getDay()];
      var day = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = {
        "year": year,
        "month": month,
        "weekday": weekday,
        "day": day,
        "hour": hour,
        "min": min,
        "sec": sec
      };
      return time;
    };


    // При получении данных с сервера иконка обновления начинает вращаться
    function spinAnimate() {
      var spin = $("#refreshButton");
      if (spin.hasClass("footer__btn-refresh_animate")) {
        spin.removeClass("footer__btn-refresh_animate");
      } else {
        spin.addClass("footer__btn-refresh_animate");
      }
    }


    // Показать попап


    // Устанавливает знаки "+" и "-" перед значением температуры
    function setTempSign(temp) {
      if (("" + temp).slice(0, 1) != "-") {
        temp = "+" + temp;
      }
      return temp;
    };
  });
})(jQuery);