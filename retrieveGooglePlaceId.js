import { readFileSync, appendFileSync, writeFileSync } from 'fs';
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

async function main(data) {
  const csvHeader = 'ID,Formatted Address,Latitude,Longitude,Display Name,Type\n';
  writeFileSync('results.csv', csvHeader);

  const jsonResults = [];

  for (let i = 1; i < data.length; i++) {
    const address = `${data[i][0]} ${data[i][1]} ${data[i][2]} ${data[i][3]} `;

    const responseFromGoogleAPI = await searchPlace(address);

    if (responseFromGoogleAPI && responseFromGoogleAPI.places) {
      const place = responseFromGoogleAPI.places[0]; // Assuming the first response to be most accurate
      // console.log(JSON.stringify(place, null, 2));

      const id = place.id;
      const formattedAddress = place.formattedAddress;
      const latitude = place.location.latitude;
      const longitude = place.location.longitude;
      const displayName = place.displayName?.text;
      const type = data[i][4].includes("On Premise") ? "bar" : "store";
      
      const csvRow = `${id},${formattedAddress},${latitude},${longitude},${displayName},${type}\n`;
      appendFileSync('results.csv', csvRow);

      jsonResults.push({ id, formattedAddress, latitude, longitude, displayName, type });
    }
  }

  writeFileSync('results.json', JSON.stringify(jsonResults, null, 2));  
}

export default main;
