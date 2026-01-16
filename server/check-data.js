const mongoose = require('mongoose');
const KnowledgeItem = require('./models/KnowledgeItem');
const dotenv = require('dotenv');

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const allCounts = await KnowledgeItem.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        console.log('KnowledgeItem Counts by Status:', allCounts);

        const approved = await KnowledgeItem.find({ status: 'Approved' }).limit(5);
        console.log('Sample Approved Items:', approved.map(i => ({ id: i._id, title: i.title, views: i.views })));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
