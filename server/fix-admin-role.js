const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixRole = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dkn');
        console.log('MongoDB Connected');

        // Force update admin_user to Administrator
        const result = await User.findOneAndUpdate(
            { username: 'admin_user' },
            { $set: { role: 'Administrator' } },
            { new: true }
        );

        if (result) {
            console.log('Successfully updated user role:', {
                username: result.username,
                newRole: result.role
            });
        } else {
            console.log('User "admin_user" not found to update.');
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixRole();
