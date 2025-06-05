import { config } from 'dotenv';
config();

import express from "express";
import generatePlacesData from "./retrieveGooglePlaceId.js";
import createEntries from './createEntryinContentful.js';
import deleteAllStockistEntries from './deleteEntriesFromContentful.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/receive-sheet-data", async (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).send("No data received");
  }
  
  const time = new Date();
  console.log("Recieved data at: ", time.toLocaleString());

  try {
    const placesData = await generatePlacesData(data);
    
    res.send("Data saved successfully");
    console.log("Responded to the server the that data is recieved");

    console.log("--------------------------------");
    console.log("Now deleting the current entries");
    await deleteAllStockistEntries();

    console.log("--------------------------------");
    console.log("Creating new entries");
    await createEntries(placesData);

  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).send("Failed to save data");
  }
});

app.get("/", (_req, res) => {
  res.send({"message": "Hello"});
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
