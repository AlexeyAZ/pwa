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
    var header = $("#header");
    var footer = $("#footer");
    var kazanId = "551487";
    var cityesObj;

    // Проверка как открыт сайт - локально или на сервере
    var local = false;
    function isLocal() {
      if (!local) {
        return "/weather";
      } else {
        return "";
      }
    }

    // start

    setContentHeight();
    getWeatherObj();


    // Ajax запрос на openweathermap
    function getWeatherObj(cityId) {
      if (cityId === undefined) {
        cityId = kazanId;
      }
      $.ajax({
        url: "http://api.openweathermap.org/data/2.5/forecast/daily?id=" + cityId + "&units=metric&lang=ru&callback=&APPID=4d53f546b1a3fa35fec27b8c8c0d4920",
        beforeSend: function() {
          spinAnimate();
        },
        success: function(dataWeather) {
          console.log("данные о погоде загружены успешно");
          //console.log(dataWeather);
          createCards(dataWeather);
          getCityesData();
        },
        error: function () {
          console.log("при загрузке данных о погоде произошла ошибка");
        },
        complete: function() {
          spinAnimate();
        }
      });
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


    // Создать карточки
    function createCards(dataWeather) {

      var numberCards = dataWeather.list.length;
      var content = $("#content");
      var cards = '<div class="container" id="cardsContainer">';
      var cardTemplate = $("#cardTemplate").html();

      for (var i = 0; i < numberCards; i++) {
        cards += '<div class="card">' + cardTemplate + '</div>';
      };

      cards += '</div>';
      content.html(cards);

      //createCardsTemplate(numberCards);
      createCardData(numberCards, dataWeather);
      getWeatherIcon(dataWeather);
    };


    // Создать разметку в каждой карточке
    /*
    function createCardsTemplate(numberCards) {

      for (var i = 0; i < numberCards; i++) {

        var card = $("#cardsContainer").find(".card").eq(i);
        card.html($("#cardTemplate").html());
      }
    }
    */


    // Создать контент для карточек
    function createCardData(numberCards, dataWeather) {

      // Устанавливает знаки "+" и "-" перед значением температуры
      function setTempSign(temp) {
        if (("" + temp).slice(0, 1) != "-") {
          temp = "+" + temp;
        }
        return temp;
      }

      for (var i = 0; i < numberCards; i++) {

        var card = $("#cardsContainer").find(".card").eq(i);

        var dayTemp = setTempSign(Math.round(dataWeather.list[i].temp.day));
        var nightTemp = setTempSign(Math.round(dataWeather.list[i].temp.night));

        var time = timeConverter(dataWeather.list[i].dt);
        var weekday = time.weekday;
        var year = time.year;
        var month = time.month;
        var day = time.day;

        card.find(".card__weekday").text(weekday);
        card.find(".card__date").text(day + "." + month + "." + year);

        card.find(".card__temperature_day").text(dayTemp);
        card.find(".card__temperature_night").text(nightTemp);
      }
    };


    // ajax запрос на получение кода иконок
    function getWeatherIcon(dataWeather) {
      $.ajax({
        url: isLocal() + "/icons.json",
        success: function(weatherIcons) {
          console.log("иконки загружены успешно");
          createIcons(dataWeather, weatherIcons);
        },
        error: function () {
          console.log("при загрузке иконок произошла ошибка");
        }
      });
    }


    // Создать иконки
    function createIcons(dataWeather, weatherIcons) {

      var cardsNumber = dataWeather.list.length;

      for (var i = 0; i < cardsNumber; i++) {

        var card = $("#cardsContainer").find(".card").eq(i);
        var prefix = 'wi wi-';
        var code = dataWeather.list[i].weather[0].id;
        var icon = weatherIcons[code].icon;

        if (!(code > 699 && code < 800) && !(code > 899 && code < 1000)) {
          icon = 'day-' + icon;
        }

        icon = prefix + icon;
        card.find(".card__icon").addClass(icon);
      }
    }


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
    }


    // Очистить кэш для приложения
    $(document).on("click", "#clearCache", function(){
      window.location.reload(true);
    });


    // Клик по полю ввода города
    header.on("click", ".header__input", function() {
      if(!$("body").hasClass("search-active")) {
      //console.log(true);
        $("body").addClass("search-active");
        //getCityesData();
      }
      if($(".header__input").on("focus")) {
        findCity();
      }
    });

    
    // if($(".header__input").on("focus")) {
    //   console.log(true);
    // }


    // Поиск города по набранному тексту
    function findCity() {
      $(".header__input").keyup(function() {
        var self = $(this);
        var inputValue = self.val();
        var cityCounter = 0;

        var cityNumber;
        var cityName;
        var cityId;

        var cityesList =  $(".search-results__list");
        cityesList.html("");

        for (var i = 0; i < cityesObj.length; i++) {
          
          cityNumber = cityesObj[i];
          cityName = cityNumber.city;
          cityId = cityNumber.id;
          /*if (cityName[0] == inputValue[0]) {
            console.log(cityName);
          }*/
          if (cityName.toLowerCase().indexOf(inputValue.toLowerCase()) != -1 && self.val().length != 0) {
            createCityesList(cityName, cityId);
            cityCounter++;
            console.log("cityCounter" + cityCounter);
          }
        }
        //console.log(inputValue);
        //$(".search-results__element").text(inputValue);
      });
    }


    // Клик вне списка городов закрывает список
    $("body").on("click", function(e) {
      var self = $(e.target);
      if (self.hasClass("search-results")) {
        $("body").removeClass("search-active");
        $(".header__input").blur();
      }
    });


    // Клик по кнопке обновить
    footer.on("click", "#refreshButton", function(){
      var cityId = $(".header__input").attr("data-city-id");
      getWeatherObj(cityId);
    });


    // Клик по элементу в списке городов
    $(".search-results__container").on("click", ".search-results__element", function(){

      var self = $(this);
      var cityId = self.data("city-id");
      var cityName = self.text();
      console.log("cityName" + cityName);
      getWeatherObj(cityId);
      $("body").removeClass("search-active");
      $(".header__input").val("");
      $(".header__input").attr("placeholder", cityName);
      $(".header__input").attr("data-city-id", cityId);
    });


    // Получить список городов
    function getCityesData() {
      $.ajax({
        url: isLocal() + "/cityes.json",
        success: function(cityesData) {
          console.log("данные о городах загружены успешно");
          cityesObj = cityesData;
          console.log(cityesObj);
          //createCityesList(cityesData);
        },
        error: function() {
          console.log("при загрузке данных о городах произошла ошибка");
        }
      });
    }


    //Создать список городов
    function createCityesList(cityName, cityId) {
      var searchResultsContainer = $(".search-results__container");
      var cityesList =  $(".search-results__list");
      //var numberCityes = cityesData.length;
      cityesList.append('<li class="search-results__element" data-city-id=' + cityId + '>' + cityName + '</li>');
      // for (var i = 0; i < numberCityes; i++) {
      //   cityesList += '<li class="search-results__element" data-city-id=' + cityesData[i].id + '>' + cityesData[i].city + '</li>';
      // }
      // cityesList += '</li>';
      // searchResultsContainer.html(cityesList);
    }


    //Создать список городов
    /*
    function createCityesList(cityesData) {
      var searchResultsContainer = $(".search-results__container");
      var cityesList = '<ul class="search-results__list">';
      var numberCityes = cityesData.length;

      for (var i = 0; i < numberCityes; i++) {
        cityesList += '<li class="search-results__element" data-city-id=' + cityesData[i].id + '>' + cityesData[i].city + '</li>';
      }

      cityesList += '</li>';
      searchResultsContainer.html(cityesList);
    }
    */


    // Установить высоту контента, равную высоте окна браузера
    function setContentHeight() {
      var windowHeight = $(window).height();
      $("html").height(windowHeight);
    }
  });
})(jQuery);