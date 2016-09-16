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

$.ajax({
  url: "http://api.openweathermap.org/data/2.5/forecast?id=551487&units=metric&APPID=4d53f546b1a3fa35fec27b8c8c0d4920",
  success: function(data) {
    var time = timeConverter(data.list[0].dt);
    //$(".time").text(time);
    //console.log(time);
  }
});

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
console.log(timeConverter(1474048800));