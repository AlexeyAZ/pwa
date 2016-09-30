;(function($){
  $(function(){


    // service worker

    /*
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    }
    */

    // Глобальные переменные
    var body = $(document.body);
    var header = $("#header");
    var footer = $("#footer");
    var search = $("#search");
    var searchResults = $("#searchResults");

    var fullCityesList = null;
    var fullIconsList = null;
    var defaultCityNumber = 3;


    // Проверка как открыт сайт - локально или на сервере
    var local = true;

    function isLocal() {
      if (!local) {
        return "/weather";
      } else {
        return "";
      }
    };


    // start
    setContentHeight();
    getCityesData();


    // Получить список городов
    function getCityesData() {

      $.ajax({

        url: isLocal() + "/cityes.json",
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

        url: isLocal() + "/icons.json",
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
      search.val("");
      search.attr("placeholder", fullCityesList[cityNumber].nameRus);
      search.attr("data-city-number", cityNumber);
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
      sityListClick(self);
    });


    function sityListClick(cityElem) {

      var cityNumber = cityElem.data("city-number");
      var cityName = fullCityesList[cityNumber].nameRus;
      var cityesList =  searchResults.find(".search-results__list");

      cityesListState();
      getWeatherData(cityNumber);
    };


    // Показать или спрятать список городов
    function cityesListState() {
      if (body.hasClass("search-active")) {
        body.removeClass("search-active");
      } else {
        body.addClass("search-active");
      }
    };


    // Клик по полю ввода города
    search.on("click", function() {
      var self = $(this);
      body.addClass("search-active");
      history.pushState('bar', 'Title', 'citiesList')
      console.log($(location).attr("pathname"));
      if(search.on("focus")) {
        findCity();
      }
    });


    // Обработчик нажатия кнопок "вперед" и "назад"
    window.addEventListener('popstate', function(e){
      if($(location).attr("pathname") == "/") {
        body.removeClass("search-active");
      } else {
        console.log(2);
      }
    }, false);


    // Клик вне списка городов закрывает список
    body.on("click", function(e) {

      var self = $(e.target);

      if (self.hasClass("search-results")) {
        body.removeClass("search-active");
        search.val("")
              .blur();
      };
    });


    // Поиск города по набранному тексту
    function findCity() {

      var cityesElementsList = searchResults.find(".search-results__element");

      cityesElementsList.each(function(){
        var self = $(this);
        self.css("display", "list-item");
      });

      search.keyup(function() {

        var self = $(this);
        var inputValue = self.val();
        var cityName;


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


    // Обновить приложение
    $(document).on("click", "#clearCache", function(){
      window.location.reload(true);
    });


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