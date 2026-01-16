const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const users = await User.find({ role: 'Knowledge Champion' }, 'username email role');
        if (users.length === 0) {
            console.log('No Knowledge Champions found! Creating one...');
            const newChamp = await User.create({
                username: 'jane_champion',
                email: 'jane@dkn.com',
                password: 'password123', // Will be hashed if pre-save hook exists, else plaintext (for test)
                role: 'Knowledge Champion',
                department: 'Engineering'
            });
            console.log('Created:', newChamp.username);
        } else {
            console.log('Champions found:', users);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
