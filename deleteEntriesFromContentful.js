import { config } from "dotenv";
config();

import contentful from 'contentful-management';

const client = contentful.createClient({
	accessToken: process.env.CMA_TOKEN,
});

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

		// let count = 0;
		for (const item of allItems) {
			// count++;
			// console.log(`Processing entry ${count}: ${item.sys.id}`);
			// console.log(`total entries: ${allItems.length}`);
			// console.log(`Remaining entries: ${allItems.length - count}`);

			// console.log(`Processing entry: ${item.sys.id}`);

			if (item.isPublished()) {
				// console.log(`Unpublishing entry: ${item.sys.id}`);
				await item.unpublish();
				// console.log(`Entry ${item.sys.id} unpublished.`);
			}

			// console.log(`Deleting entry: ${item.sys.id}`);
			await environment.deleteEntry(item.sys.id);
			// console.log(`Entry ${item.sys.id} unpublished and deleted.`);
		}

		console.log('All entries deleted successfully!');
	} catch (error) {
		console.error('Error deleting entries:', error);
	}
}

// deleteAllStockistEntries();
export default deleteAllStockistEntries;
