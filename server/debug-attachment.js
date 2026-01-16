const mongoose = require('mongoose');
const KnowledgeItem = require('./models/KnowledgeItem');
const dotenv = require('dotenv');

dotenv.config();

const checkLatest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const item = await KnowledgeItem.findOne().sort({ createdAt: -1 });
        console.log('Latest Item:', item.title);
        console.log('Attachments:', JSON.stringify(item.attachments, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkLatest();
