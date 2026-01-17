const mongoose = require('mongoose');
const KnowledgeItem = require('./models/KnowledgeItem');
const dotenv = require('dotenv');

dotenv.config();

const cleanBroken = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Find items with attachments that have no 'name' (empty objects)
        const result = await KnowledgeItem.updateMany(
            {},
            {
                $pull: {
                    attachments: {
                        name: { $exists: false }
                    }
                }
            }
        );

        console.log(`Cleaned up attachments for ${result.modifiedCount} items.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanBroken();
