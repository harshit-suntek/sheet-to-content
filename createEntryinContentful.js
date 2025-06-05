import { config } from "dotenv";
config();

import contentful from 'contentful-management';
import fs from 'fs';

const client = contentful.createClient({
	accessToken: process.env.CMA_TOKEN,
});

async function createEntries() {
	try {
		const space = await client.getSpace(process.env.SPACE_ID);
		const environment = await space.getEnvironment(
			process.env.ENVIRONMENT_ID
		);

		const placesData = JSON.parse(
			fs.readFileSync('results.json', 'utf-8')
		);

		for (const place of placesData) {
			const {
				id: placeId,
				formattedAddress,
				latitude,
				longitude,
				displayName,
				type,
			} = place;

			try {
				const newEntry = await environment.createEntry('stockist', {
					fields: {
						name: { 'en-US': displayName },
						type: { 'en-US': type },
						address: { 'en-US': formattedAddress },
						location: {
							'en-US': { lat: latitude, lon: longitude },
						},
						placeId: { 'en-US': placeId },
						description: { 'en-US': '' },
					},
				});

				await newEntry.publish();

				console.log(`Entry created and published: ${newEntry.sys.id}`);
			} catch (error) {
				console.error(
					`Error creating entry for ${displayName}: ${error.message}`
				);
				continue;
			}
		}

		console.log('All entries created and published successfully!');
	} catch (error) {
		console.error('Error creating entries:', error);
	}
}

// createEntries();
export default createEntries;
