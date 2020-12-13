$(document).ready(() => {
  const today = luxon.DateTime.local().toFormat('D');
  const myKey = 'a8264870351b77d127763c42dc124460';
  const history = [
    ...new Set(JSON.parse(window.localStorage.getItem('history')) || []),
  ];

  $('#search-btn').click(function (e) {
    e.preventDefault();

    const cityName = $('#search').val().trim();

    $('.city-info').empty();
    $('#prev-cities').empty();
    $('#day1').empty();
    $('#day2').empty();
    $('#day3').empty();
    $('#day4').empty();
    $('#day5').empty();

    if (cityName === '') return;
    getWeather(cityName);
    history.push(cityName);
    window.localStorage.setItem('history', JSON.stringify(history));
    $('#search').val('');
  });
  // main function
  function getWeather(city) {
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${myKey}`;
    $.ajax({
      url: queryURL,
      method: 'GET',
    }).then(function (data) {
      const conditions = data.weather[0].main;

      const city = $('<h3>')
        .attr('class', 'city-name')
        .text(data.name + ' (' + today + ') ');

      console.log(data);

      if (conditions === 'Clear') {
        city.append($('<i>').attr('class', 'fas fa-sun'));
      } else if (conditions === 'Rain') {
        city.append($('<i>').attr('class', 'fas fa-cloud'));
      } else if (conditions === 'Clouds') {
        city.append($('<i>').attr('class', 'fas fa-cloud-showers-heavy'));
      }

      const degreesF = Math.floor((data.main.temp - 273.15) * 1.8 + 32);
      const temp = $('<p>').text('Temp: ' + degreesF + ' F');
      const humidity = $('<p>').text('Humidity: ' + data.main.humidity + ' %');
      const wind = $('<p>').text('Wind Speed: ' + data.wind.speed + ' MPH');

      $('.city-info').append(city, temp, humidity, wind);
      makeHistory();

      function buildSecondURL() {
        let querySecondURL = 'https://api.openweathermap.org/data/2.5/onecall?';

        let querySecondParams = { appid: 'a8264870351b77d127763c42dc124460' };
        querySecondParams.lat = data.coord.lat;
        querySecondParams.lon = data.coord.lon;

        return querySecondURL + $.param(querySecondParams);
      }

      let secondQueryURL = buildSecondURL();

      $.ajax({
        url: secondQueryURL,
        method: 'GET',
      }).then(function (response) {
        let UVI = response.current.uvi;
        let indexUV = $('<p>')
          .text('UV Index: ')
          .append($('<span>').attr('class', 'uviColor').text(UVI));

        $('.city-info').append(indexUV);
        if (UVI <= 3) {
          $('.uviColor').css('color', 'green');
        } else if (UVI > 3 && UVI < 6) {
          $('.uviColor').css('color', 'yellow');
        } else if (UVI > 6 && UVI < 8) {
          $('.uviColor').css('color', 'orange');
        } else if (UVI > 8 && UVI < 11) {
          $('.uviColor').css('color', 'red');
        } else {
          $('.uviColor').css('color', 'violet');
        }

        // display 5-day forecast
        for (let i = 1; i < 6; i++) {
          let F1 = Math.floor((response.daily[i].temp.day - 273.15) * 1.8 + 32);
          let dateInUNIX = response.daily[i].dt;
          let daysInRow = luxon.DateTime.fromSeconds(dateInUNIX).toFormat('D');
          $('#day' + [i]).append($('<h6>').text(daysInRow));
          let condition = response.daily[i].weather[0].main;
          if (condition == 'Clear') {
            $('#day' + [i]).append($('<i>').attr('class', 'fas fa-sun'));
          } else if (condition == 'Rain') {
            $('#day' + [i]).append(
              $('<i>').attr('class', 'fas fa-cloud-showers-heavy')
            );
          } else if (condition == 'Clouds') {
            $('#day' + [i]).append($('<i>').attr('class', 'fas fa-cloud'));
          }
          $('#day' + [i]).append(
            $('<p>')
              .attr('class', 'pForForecast')
              .text('Temp: ' + F1 + 'F')
          );
          $('#day' + [i]).append(
            $('<p>')
              .attr('class', 'pForForecast')
              .text('Humidity: ' + response.daily[i].humidity + '%')
          );
        }
      });
    });
  }

  // create previously searched cities set
  function makeHistory() {
    function makeRow(text) {
      $('#prev-cities').prepend(
        $('<h5>').attr('class', 'search-history').text(text)
      );
    }

    for (let i = 0; i < history.length; i++) {
      makeRow(history[i]);
    }
  }

  // function to clear history box and local storage
  $('#clearBtn').on('click', function () {
    localStorage.clear();
    $('#prev-cities').empty();
    location.reload();
  });

  if (history.length > 0) {
    getWeather(history[history.length - 1]);
  }
  function historyOnClick(event) {
    const histEl = event.target;
    if (event.target.matches('h5')) {
      $('.city-info').empty();
      $('#prev-cities').empty();
      $('#day1').empty();
      $('#day2').empty();
      $('#day3').empty();
      $('#day4').empty();
      $('#day5').empty();
      const pastCity = histEl.textContent.trim();

      getWeather(pastCity);
    }
  }
  $(document).click(historyOnClick);
});
