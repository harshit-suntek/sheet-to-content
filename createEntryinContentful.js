import { config } from "dotenv";
config();

import client from './contentful-client.js';

async function createEntries(placesData) {
	try {
		const space = await client.getSpace(process.env.SPACE_ID);
		const environment = await space.getEnvironment(
			process.env.ENVIRONMENT_ID
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

export default createEntries;
