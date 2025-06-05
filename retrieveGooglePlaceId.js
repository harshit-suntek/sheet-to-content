import { config } from "dotenv";
config();

import axios from 'axios';

async function searchPlace(textQuery) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  try {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      { textQuery },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.location,places.displayName,places.formattedAddress',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching place data:', error.response?.data || error.message);
    return null;
  }
}

async function generatePlacesData(rawData) {
  const results = [];

  for (let i = 1; i < rawData.length; i++) {
    const address = `${rawData[i][0]} ${rawData[i][1]} ${rawData[i][2]} ${rawData[i][3]} `;

    const responseFromGoogleAPI = await searchPlace(address);

    if (responseFromGoogleAPI && responseFromGoogleAPI.places) {
      const place = responseFromGoogleAPI.places[0]; // Assuming the first response to be most accurate

      const id = place.id;
      const formattedAddress = place.formattedAddress;
      const latitude = place.location.latitude;
      const longitude = place.location.longitude;
      const displayName = place.displayName?.text;
      const type = rawData[i][4].includes("On Premise") ? "bar" : "store";
      
      results.push({ id, formattedAddress, latitude, longitude, displayName, type });
    }
    console.log(i);
  }

  console.log("Place Data generated through Google Place API");
  return results;
}

export default generatePlacesData;
