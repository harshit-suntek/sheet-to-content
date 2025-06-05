import { config } from 'dotenv';
config();

import express from "express";
import generatePlacesData from "./retrieveGooglePlaceId.js";
import createEntries from "./createEntryinContentful.js";
import deleteAllStockistEntries from "./deleteEntriesFromContentful.js";

const app = express();

const PORT = 3000;
const BEARER_TOKEN = process.env.BEARER_SECRET_TOKEN;

app.use(express.json({ limit: '10mb' }));

// Securing the requests
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== BEARER_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  next();
}

app.post("/receive-sheet-data", authenticateToken, async (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).send("No data received");
  }
  
  const time = new Date();
  console.log("Recieved data at: ", time.toLocaleString());
  res.status(202).send("Data received.");

  try {
    const placesData = await generatePlacesData(data);

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
