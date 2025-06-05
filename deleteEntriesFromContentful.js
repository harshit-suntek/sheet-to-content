import { config } from "dotenv";
config();

import client from "./contentful-client.js";

async function deleteAllStockistEntries() {
	try {
		const space = await client.getSpace(process.env.SPACE_ID);
		const environment = await space.getEnvironment(
			process.env.ENVIRONMENT_ID
		);

		let allItems = [];
		let skip = 0;
		const limit = 1000;
		let total = 0;

		console.log('Fetching all `stockist` entries...');

		do {
			const response = await environment.getEntries({
				content_type: 'stockist',
				skip: skip,
				limit: limit,
			});

			total = response.total;
			allItems.push(...response.items);
			skip += limit;
		} while (allItems.length < total);

		console.log(`Found ${allItems.length} entries.`);

		for (const item of allItems) {
			if (item.isPublished()) {
				await item.unpublish();
			}

			await environment.deleteEntry(item.sys.id);
		}

		console.log('All entries deleted successfully!');
	} catch (error) {
		console.error('Error deleting entries:', error);
	}
}

export default deleteAllStockistEntries;
