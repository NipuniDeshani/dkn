const mongoose = require('mongoose');
const KnowledgeItem = require('./models/KnowledgeItem');
const dotenv = require('dotenv');

dotenv.config();

const seedQualityFlags = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Mongo');

        // Find some Approved items
        const items = await KnowledgeItem.find({ status: 'Approved' }).limit(5);

        if (items.length === 0) {
            console.log('No approved items found to flag.');
            process.exit();
        }

        // Flag 3 items
        let count = 0;
        for (const item of items) {
            if (count >= 3) break;

            item.qualityFlag = true;
            item.qualityScore = Math.floor(Math.random() * 40) + 40; // 40-80 score
            item.qualityIssues = ['Low Clarity', 'Possible Duplicate'];

            // Also update aiAnalysis duplicateScore for realism
            if (item.aiAnalysis) {
                item.aiAnalysis.duplicateScore = 85;
            } else {
                item.aiAnalysis = { duplicateScore: 85 };
            }

            await item.save();
            console.log(`Flagged item: ${item.title}`);
            count++;
        }

        console.log('Done flagging items.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedQualityFlags();
