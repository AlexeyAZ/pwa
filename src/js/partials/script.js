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


//Ajax запрос на openweathermap
function getWeatherObj() {
  $.ajax({
    url: "http://api.openweathermap.org/data/2.5/forecast/daily?id=551487&units=metric&lang=ru&APPID=4d53f546b1a3fa35fec27b8c8c0d4920",
    success: function(dataWeather) {
      console.log(dataWeather);
      getDate(dataWeather);
    }
  });
};



function getDate(dataWeather) {
  for(var i = 0; i < dataWeather.list.length; i++) {
    var weatherDayData = dataWeather.list[i];
    var date = timeConverter(weatherDayData.dt);
    console.log(date);
  };
};

function getTemperature(listItem) {
  return listItem.main.temp;
};

function createCards(cardsNumber) {
  var container = $("#content");
  var cards = '<div class="container">';

  for (var i = 0; i < cardsNumber; i++) {
    cards += '<div class="card">';
  };
};

getWeatherObj();


function timeConverter(UNIX_timestamp){
   var a = new Date(UNIX_timestamp * 1000);
   var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
   var year = a.getFullYear();
   var month = months[a.getMonth()];
   var date = a.getDate();
   var hour = a.getHours();
   var min = a.getMinutes();
   var sec = a.getSeconds();
   var time = date + ' ' + month + ' ' + year;// + ' ' + hour + ':' + min + ':' + sec ;
   return time;
}