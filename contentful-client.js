import { config } from "dotenv";
config();

import contentful from "contentful-management";

const client = contentful.createClient({
	accessToken: process.env.CMA_TOKEN,
});

export default client;
