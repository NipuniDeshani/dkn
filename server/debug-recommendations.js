const mongoose = require('mongoose');
const RecommendationEngine = require('./services/RecommendationEngine');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const debugRecs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Find 'john_consultant' (User role, username 'john_consultant' or similar)
        // Adjust query if needed. Assuming user exists as they are logged in.
        // We will just find ANY consultant.
        const user = await User.findOne({ role: 'Consultant', username: 'john_consultant' });

        if (!user) {
            console.log('User not found. Finding first consultant...');
            const altUser = await User.findOne({ role: 'Consultant' });
            if (!altUser) {
                console.log('No consultants found.');
                process.exit();
            }
            console.log('Testing with:', altUser.username);

            const recs = await RecommendationEngine.getRecommendations(altUser._id);
            console.log('Recs:', JSON.stringify(recs, null, 2));
        } else {
            console.log('Testing with:', user.username);
            const recs = await RecommendationEngine.getRecommendations(user._id);
            console.log('Recs:', JSON.stringify(recs, null, 2));
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugRecs();
