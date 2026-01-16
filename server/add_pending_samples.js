const mongoose = require('mongoose');
const dotenv = require('dotenv');
const KnowledgeItem = require('./models/KnowledgeItem');
const User = require('./models/User');
const Validation = require('./models/ValidationWorkflow');

dotenv.config();

const seedPending = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Get an author (Consultant)
        const author = await User.findOne({ role: 'Consultant' });
        if (!author) {
            console.log('No consultant found');
            process.exit(1);
        }

        const samples = [
            {
                title: "Cloud Migration Strategy 2026",
                description: "Comprehensive guide for migrating legacy on-premise systems to hybrid cloud architecture, including risk assessment templates and cost calculators.",
                category: "Technology",
                region: "Global",
                status: "Pending",
                author: author._id,
                metadata: { contentType: "Guide", format: "PDF" },
                tags: ["cloud", "migration", "aws", "azure"]
            },
            {
                title: "Q1 Financial Compliance Report",
                description: "Detailed analysis of Q1 financial performance against new regulatory standards. Includes audit trails and variance analysis.",
                category: "Finance",
                region: "North America",
                status: "Pending",
                author: author._id,
                metadata: { contentType: "Report", format: "DOCX" },
                tags: ["finance", "compliance", "audit"]
            },
            {
                title: "Remote Work Security Policy v2",
                description: "Updated security protocols for remote employees, covering VPN usage, device management, and data handling procedures.",
                category: "Operations",
                region: "Europe",
                status: "Pending",
                author: author._id,
                metadata: { contentType: "Policy", format: "PDF" },
                tags: ["security", "remote-work", "policy"]
            }
        ];

        for (const sample of samples) {
            const item = await KnowledgeItem.create(sample);
            console.log(`Created: ${item.title}`);

            // Optional: Create Validation record
            await Validation.create({
                knowledgeItem: item._id,
                status: 'Pending',
                priority: 'High',
                reviewHistory: [{
                    reviewer: author._id,
                    action: 'Assigned',
                    comment: 'Auto-generated sample for review'
                }]
            });
        }

        console.log('Seeding complete!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedPending();
