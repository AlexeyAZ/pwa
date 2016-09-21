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

    // start

    setContentHeight();
    getWeatherObj();

    // Глобальные переменные
    var header = $("#header");
    var footer = $("#footer");

    // Ajax запрос на openweathermap
    function getWeatherObj() {
      $.ajax({
        url: "http://api.openweathermap.org/data/2.5/forecast/daily?id=551487&units=metric&lang=ru&callback=&APPID=4d53f546b1a3fa35fec27b8c8c0d4920",
        beforeSend: function() {
          $("#refreshButton").addClass("footer__btn-refresh_animate");
        },
        success: function(dataWeather) {
          console.log(dataWeather);
          createCards(dataWeather);
        },
        complete: function() {
          $("#refreshButton").removeClass("footer__btn-refresh_animate");
        }
      });
    };


    // Создать карточки
    function createCards(dataWeather) {
      var cardsNumber = dataWeather.list.length;
      var content = $("#content");
      var cards = '<div class="container" id="cardsContainer">';

      for (var i = 0; i < cardsNumber; i++) {
        cards += '<div class="card"></div>';
      };

      cards += '</div>';
      content.html(cards);

      for (var i = 0; i < cardsNumber; i++) {

        var card = $("#cardsContainer").find(".card").eq(i);
        card.html($("#cardTemplate").html());

        setCardData(card, dataWeather);
      }
      getWeatherIcon(dataWeather);
    };


    // Создать контент для карточек
    function setCardData(card, dataWeather) {

      var cardNumber = card.index();
      var dayTemp = setTempSign(Math.round(dataWeather.list[cardNumber].temp.day));
      var nightTemp = setTempSign(Math.round(dataWeather.list[cardNumber].temp.night));

      function setTempSign(temp) {
        if (("" + temp).slice(0, 1) != "-") {
          temp = "+" + temp;
        }
        return temp;
      }

      var time = timeConverter(dataWeather.list[cardNumber].dt);
      var weekday = time.weekday;
      var year = time.year;
      var month = time.month;

      if(("" + month).length == 1) {
        month = "0" + month;
      };

      var day = time.day;

      card.find(".card__temperature_day").text(dayTemp);
      card.find(".card__temperature_night").text(nightTemp);

      card.find(".card__weekday").text(weekday);
      card.find(".card__date").text(day + "." + month + "." + year);

    };


    // ajax запрос на получение кода иконок
    function getWeatherIcon(dataWeather) {
      $.ajax({
        url: "/weather/icons.json",
        success: function(weatherIcons) {
          createIcons(dataWeather, weatherIcons)
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
      if($("body").hasClass("search-active")) {

      } else {
        $("body").addClass("search-active");
      }
    });


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
      getWeatherObj();
    });


    // Клик по элементу в списке городов
    $(".search-results__element").click(function(){
      console.log(true);
    });


    // Установить высоту контента, равную высоте окна браузера
    function setContentHeight() {
      var windowHeight = $(window).height();
      $("html").height(windowHeight);
    }

    $(window).resize(function(){

    });
  });
})(jQuery);