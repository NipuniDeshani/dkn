const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dkn');
        console.log('MongoDB Connected');

        const user = await User.findOne({ username: 'admin_user' });
        if (user) {
            console.log('User found:', {
                username: user.username,
                email: user.email,
                role: user.role,
                _id: user._id
            });
        } else {
            console.log('User "admin_user" not found!');
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
