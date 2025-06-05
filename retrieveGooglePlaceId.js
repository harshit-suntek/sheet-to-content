// import { readFileSync, appendFileSync, writeFileSync } from 'fs';
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
  // const csvHeader = 'ID,Formatted Address,Latitude,Longitude,Display Name,Type\n';
  // writeFileSync('results.csv', csvHeader);

  const results = [];

  for (let i = 1; i < rawData.length; i++) {
    const address = `${rawData[i][0]} ${rawData[i][1]} ${rawData[i][2]} ${rawData[i][3]} `;

    const responseFromGoogleAPI = await searchPlace(address);

    if (responseFromGoogleAPI && responseFromGoogleAPI.places) {
      const place = responseFromGoogleAPI.places[0]; // Assuming the first response to be most accurate
      // console.log(JSON.stringify(place, null, 2));

      const id = place.id;
      const formattedAddress = place.formattedAddress;
      const latitude = place.location.latitude;
      const longitude = place.location.longitude;
      const displayName = place.displayName?.text;
      const type = rawData[i][4].includes("On Premise") ? "bar" : "store";
      
      // const csvRow = `${id},${formattedAddress},${latitude},${longitude},${displayName},${type}\n`;
      // appendFileSync('results.csv', csvRow);

      results.push({ id, formattedAddress, latitude, longitude, displayName, type });
    }
  }

  // writeFileSync('results.json', JSON.stringify(jsonResults, null, 2));  
  return results;
}

export default generatePlacesData;
