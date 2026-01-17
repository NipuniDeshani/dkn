const mongoose = require('mongoose');
const KnowledgeItem = require('./models/KnowledgeItem');
const dotenv = require('dotenv');

dotenv.config();

const findBroken = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const items = await KnowledgeItem.find({ 'attachments.0': { $exists: true } });

        let count = 0;
        console.log('--- Scanning for Broken Attachments ---');

        items.forEach(item => {
            const badAttachments = item.attachments.filter(a => !a.name || !a.url || !a.size);
            if (badAttachments.length > 0) {
                count++;
                console.log(`\nItem ID: ${item._id}`);
                console.log(`Title: ${item.title}`);
                console.log(`Bad Attachments: ${badAttachments.length}`);
                console.log(JSON.stringify(badAttachments, null, 2));
            }
        });

        console.log(`\n--- Found ${count} items with broken attachments ---`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findBroken();
