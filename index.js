const express = require('express')
const axios = require('axios')
const port = 3000

const app = express()

const openWeatherApiKey = 'd5b8cac37cee36a2e296a98b7f1d7bef'
const googleMapsApiKey = 'AIzaSyB004dQO4K8F3I6uA23H9JgqWf4i9MMMY8'
const nasaApiKey = 'QqbYKcxoeeD0aAs5BOlAQT6QECn4rkdtlHYq23bb'

app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.post('/weather', async (req, res) => {
    let city = req.body.city
    try {
        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather?q='+ city + '&units=metric&appid=' + openWeatherApiKey)
        const weatherData = weatherResponse.data
        const temperature = weatherData.main.temp
        const feelsLike = weatherData.main.feels_like
        const windSpeed = weatherData.wind.speed
        const country = weatherData.sys.country
        const pressure = weatherData.main.pressure
        const humidity = weatherData.main.humidity
        const description = weatherData.weather[0].description
        const rainVolume = weatherData.rain && weatherData.rain['3h'] ? weatherData.rain['3h'] : 0
        const icon = weatherData.weather[0].icon
        const imageURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png"

        const geoResponse = await axios.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            {
                params: {
                    address: city,
                    key: googleMapsApiKey
                }
            }
        );

        const location = geoResponse.data.results[0].geometry.location
        const latitude = location.lat
        const longitude = location.lng

        const mapURL = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=12&size=400x300&markers=color:red|${latitude},${longitude}&key=${googleMapsApiKey}`

        const nasaResponse = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`)
        const apodData = nasaResponse.data;

        res.setHeader('Content-Type', 'text/html')
        res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">')

        res.write('<div class="container d-flex">')
        res.write('<div class="col-6">')
        res.write("<h1>Temperature in " + city + " is: " + temperature + " C</h1>")
        res.write("<p> The weather is: " + description + "</p>")
        res.write("<img src= " + imageURL + ">")
        res.write("<p> Coordinates: longitude: " + longitude + " latitude: " + latitude + "</p>")
        res.write("<p> Feels like: " + feelsLike + " C</p>")
        res.write("<p> Humidity: " + humidity + "% </p>")
        res.write("<p> Pressure: " + pressure + " hPa</p>")
        res.write("<p> Wind Speed is: " + windSpeed + " meters/second</p>")
        res.write("<p> The country code is: " + country + "</p>")
        res.write("<p> Rain volume of last 3 hours: " + rainVolume + "mm</p>")

        res.write("<img src= " + mapURL + ">")
        res.write("</div>")

        res.write('<div class="col-5">')
        res.write("<h2>Astronomy Picture of the Day (APOD)</h2>")
        res.write(`<img style="width: 70%" src="${apodData.url}" alt="${apodData.title}">`)
        res.write(`<p>${apodData.title}</p>`)
        res.write(`<p>${apodData.explanation}</p>`)
        res.write("</div>")
        res.write("</div>")

        res.send()
    }
    catch {
        console.error('error')
        res.write("<p> You've probably inputed the wrong city, try again</p>")
        res.write("<a href='/'> Go back </a>")
        res.send()
    }
})

app.listen(port, () => {
    console.log('Server started: http://localhost:' + port + '/')
});
