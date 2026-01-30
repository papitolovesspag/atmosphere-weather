import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Setup public folder for CSS and EJS
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
 
// 1. GET Route: Renders the home page (initially empty)
app.get("/", (req, res) => {
  res.render("index.ejs", { content: null, error: null });
});

// 2. POST Route: Handles the city search
app.post("/", async (req, res) => {
  const city = req.body.city;
  
  try {
    // Step 1: Get Coordinates for the city
    // Documentation: https://open-meteo.com/en/docs/geocoding-api
    const geoResponse = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
    );

    // Check if the city was found
    if (!geoResponse.data.results) {
      throw new Error("City not found. Please try again.");
    }

    const location = geoResponse.data.results[0];
    const lat = location.latitude;
    const lon = location.longitude;

    // Step 2: Get Weather using those coordinates
    // Documentation: https://open-meteo.com/en/docs
    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );

    const weatherData = weatherResponse.data.current_weather;

    // Render index.ejs with the new data
    res.render("index.ejs", { 
      content: weatherData, 
      city: location.name,
      country: location.country,
      error: null 
    });

  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", { 
      content: null, 
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});