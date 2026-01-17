const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import all models
const User = require('./models/User');
const KnowledgeItem = require('./models/KnowledgeItem');
const AuditLog = require('./models/AuditLog');
const Metadata = require('./models/Metadata');
const Validation = require('./models/ValidationWorkflow'); // Fixed: Use ValidationWorkflow (same as controller)
const Leaderboard = require('./models/Leaderboard');
const Configuration = require('./models/Configuration');
const Recommendation = require('./models/Recommendation');
const MigrationHandler = require('./models/MigrationHandler');
const Mentorship = require('./models/Mentorship');
const TrainingModule = require('./models/TrainingModule');
const TrainingProgress = require('./models/TrainingProgress');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Sample users for each role
const users = [
    {
        username: 'john_consultant',
        email: 'consultant@dkn.com',
        password: 'password123',
        role: 'Consultant',
        skills: ['Strategy', 'Digital Transformation'],
        region: 'North America'
    },
    {
        username: 'sarah_champion',
        email: 'champion@dkn.com',
        password: 'password123',
        role: 'Knowledge Champion',
        skills: ['Content Curation', 'Quality Assurance'],
        region: 'Europe'
    },
    {
        username: 'mike_manager',
        email: 'manager@dkn.com',
        password: 'password123',
        role: 'Project Manager',
        skills: ['Project Management', 'Agile'],
        region: 'Asia Pacific'
    },
    {
        username: 'admin_user',
        email: 'admin@dkn.com',
        password: '123456',
        role: 'Administrator',
        skills: ['System Administration', 'Security'],
        region: 'Global'
    },
    {
        username: 'governance_lead',
        email: 'governance@dkn.com',
        password: 'password123',
        role: 'Governance Council',
        skills: ['Governance', 'Compliance'],
        region: 'Global'
    }
];

// Sample metadata
const metadata = [
    { type: 'category', value: 'strategy', label: 'Strategy' },
    { type: 'category', value: 'technical', label: 'Technical' },
    { type: 'category', value: 'market-research', label: 'Market Research' },
    { type: 'category', value: 'operations', label: 'Operations' },
    { type: 'category', value: 'finance', label: 'Finance' },
    { type: 'region', value: 'north-america', label: 'North America' },
    { type: 'region', value: 'europe', label: 'Europe' },
    { type: 'region', value: 'asia-pacific', label: 'Asia Pacific' },
    { type: 'region', value: 'global', label: 'Global' },
    { type: 'contentType', value: 'document', label: 'Document' },
    { type: 'contentType', value: 'presentation', label: 'Presentation' },
    { type: 'contentType', value: 'template', label: 'Template' },
    { type: 'contentType', value: 'case-study', label: 'Case Study' }
];

// Sample configurations
const configurations = [
    { key: 'validation.autoAssign', value: true, category: 'workflow', description: 'Auto-assign validations to Knowledge Champions' },
    { key: 'validation.maxPendingDays', value: 7, category: 'workflow', description: 'Maximum days for pending validation' },
    { key: 'ai.similarityThreshold', value: 0.8, category: 'ai', description: 'Threshold for duplicate detection' },
    { key: 'ai.recommendationRefreshDays', value: 1, category: 'ai', description: 'Days between recommendation refresh' },
    { key: 'leaderboard.updateInterval', value: 3600, category: 'system', description: 'Leaderboard update interval in seconds' },
    { key: 'notification.emailEnabled', value: true, category: 'notification', description: 'Enable email notifications' }
];

// Sample knowledge items
const getKnowledgeItems = (userIds) => [
    {
        title: 'Digital Transformation Strategy Framework',
        description: 'A comprehensive framework for guiding organizations through digital transformation initiatives. Covers assessment, planning, execution, and measurement phases.',
        category: 'Strategy',
        tags: ['Digital Transformation', 'Strategy', 'Framework', 'Enterprise'],
        region: 'Global',
        author: userIds.consultant,
        status: 'Approved',
        metadata: { contentType: 'Document', format: 'PDF' }
    },
    {
        title: 'Cloud Migration Best Practices',
        description: 'Guidelines and best practices for migrating enterprise applications to cloud platforms. Includes AWS, Azure, and GCP considerations.',
        category: 'Technical',
        tags: ['Cloud', 'Migration', 'AWS', 'Azure', 'Best Practices'],
        region: 'North America',
        author: userIds.consultant,
        status: 'Approved',
        metadata: { contentType: 'Document', format: 'PDF' }
    },
    {
        title: 'Market Analysis Template 2024',
        description: 'Template for conducting comprehensive market analysis including competitor analysis, SWOT, and market sizing.',
        category: 'Market Research',
        tags: ['Market Analysis', 'Template', 'SWOT', 'Competitor Analysis'],
        region: 'Europe',
        author: userIds.manager,
        status: 'Pending',
        metadata: { contentType: 'Template', format: 'XLSX' }
    },
    {
        title: 'Agile Implementation Guide',
        description: 'Step-by-step guide for implementing Agile methodologies in traditional organizations. Covers Scrum, Kanban, and hybrid approaches.',
        category: 'Operations',
        tags: ['Agile', 'Scrum', 'Kanban', 'Methodology'],
        region: 'Asia Pacific',
        author: userIds.consultant,
        status: 'Pending',
        metadata: { contentType: 'Document', format: 'PDF' }
    },
    {
        title: 'Financial Due Diligence Checklist',
        description: 'Comprehensive checklist for conducting financial due diligence during M&A activities.',
        category: 'Finance',
        tags: ['Finance', 'Due Diligence', 'M&A', 'Checklist'],
        region: 'Global',
        author: userIds.manager,
        status: 'Approved',
        metadata: { contentType: 'Template', format: 'DOCX' }
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await KnowledgeItem.deleteMany({});
        await AuditLog.deleteMany({});
        await Metadata.deleteMany({});
        await Validation.deleteMany({});
        await Leaderboard.deleteMany({});
        await Configuration.deleteMany({});
        await Recommendation.deleteMany({});
        await MigrationHandler.deleteMany({});

        // Create users
        console.log('Creating users...');
        const salt = await bcrypt.genSalt(10);
        const createdUsers = {};

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, salt);
            const created = await User.create({
                ...user,
                password: hashedPassword
            });

            // Store reference by role for later use
            if (user.role === 'Consultant') createdUsers.consultant = created._id;
            if (user.role === 'Knowledge Champion') createdUsers.champion = created._id;
            if (user.role === 'Project Manager') createdUsers.manager = created._id;
            if (user.role === 'Administrator') createdUsers.admin = created._id;
            if (user.role === 'Governance Council') createdUsers.governance = created._id;

            console.log(`  Created user: ${user.email} (${user.role})`);
        }

        // Create metadata
        console.log('Creating metadata...');
        for (const meta of metadata) {
            await Metadata.create({ ...meta, createdBy: createdUsers.admin });
        }

        // Create configurations
        console.log('Creating configurations...');
        for (const config of configurations) {
            await Configuration.create({ ...config, lastModifiedBy: createdUsers.admin });
        }

        // Create knowledge items
        console.log('Creating knowledge items...');
        const knowledgeItems = getKnowledgeItems(createdUsers);
        const createdItems = [];

        for (const item of knowledgeItems) {
            const created = await KnowledgeItem.create(item);
            createdItems.push(created);
            console.log(`  Created: ${item.title} (${item.status})`);
        }

        // Create validations for pending items
        console.log('Creating validations...');
        const pendingItems = createdItems.filter(item => item.status === 'Pending');
        for (const item of pendingItems) {
            await Validation.create({
                knowledgeItem: item._id,
                assignedReviewer: createdUsers.champion,
                status: 'Pending',
                priority: 'Medium',
                reviewHistory: [{
                    reviewer: createdUsers.admin,
                    action: 'Assigned',
                    comment: 'Auto-assigned on upload'
                }]
            });
        }

        // Create leaderboard entries
        console.log('Creating leaderboard entries...');
        const leaderboardEntries = [
            { user: createdUsers.consultant, scores: { uploads: 3, approvals: 0, views: 15, downloads: 5, validations: 0 } },
            { user: createdUsers.champion, scores: { uploads: 1, approvals: 10, views: 20, downloads: 8, validations: 12 } },
            { user: createdUsers.manager, scores: { uploads: 2, approvals: 0, views: 10, downloads: 3, validations: 0 } }
        ];

        for (const entry of leaderboardEntries) {
            const lb = new Leaderboard(entry);
            lb.calculateTotalScore();
            await lb.save();
        }

        // Create audit logs
        console.log('Creating sample audit logs...');
        const auditLogs = [
            { action: 'USER_REGISTER', actor: createdUsers.admin, target: createdUsers.consultant, targetModel: 'User' },
            { action: 'KNOWLEDGE_UPLOAD', actor: createdUsers.consultant, target: createdItems[0]._id, targetModel: 'KnowledgeItem' },
            { action: 'KNOWLEDGE_APPROVED', actor: createdUsers.champion, target: createdItems[0]._id, targetModel: 'KnowledgeItem' },
            { action: 'USER_LOGIN', actor: createdUsers.consultant, target: createdUsers.consultant, targetModel: 'User' }
        ];

        for (const log of auditLogs) {
            await AuditLog.create(log);
        }

        // Create sample recommendations
        console.log('Creating sample recommendations...');
        const approvedItems = createdItems.filter(item => item.status === 'Approved');
        const recommendationReasons = [
            'Based on your skills in Strategy',
            'Popular in your region',
            'Similar to content you viewed'
        ];

        // Create recommendations for consultant and manager
        for (const userId of [createdUsers.consultant, createdUsers.manager]) {
            await Recommendation.create({
                user: userId,
                type: 'content',
                recommendations: approvedItems.slice(0, 3).map((item, i) => ({
                    item: item._id,
                    score: Math.random() * 0.5 + 0.5,
                    reason: recommendationReasons[i % recommendationReasons.length],
                    isViewed: false,
                    isActedUpon: false
                })),
                isActive: true
            });
        }

        // Create sample migrations
        console.log('Creating sample migrations...');
        const sampleMigrations = [
            {
                name: 'SharePoint Document Import',
                description: 'Import legacy documents from SharePoint 2019 to DKN',
                source: {
                    system: 'SharePoint',
                    connectionDetails: { url: 'https://sharepoint.company.com/sites/docs' }
                },
                target: {
                    system: 'DKN',
                    connectionDetails: { endpoint: 'internal' }
                },
                status: 'Pending',
                initiatedBy: createdUsers.admin,
                progress: { total: 150, processed: 0, failed: 0 }
            },
            {
                name: 'Confluence Knowledge Base',
                description: 'Migrate technical documentation from Confluence',
                source: {
                    system: 'Confluence',
                    connectionDetails: { url: 'https://confluence.company.com' }
                },
                target: {
                    system: 'DKN',
                    connectionDetails: { endpoint: 'internal' }
                },
                status: 'Completed',
                initiatedBy: createdUsers.admin,
                progress: { total: 75, processed: 75, failed: 2 },
                completedAt: new Date()
            },
            {
                name: 'Legacy Database Export',
                description: 'Import records from legacy MySQL knowledge database',
                source: {
                    system: 'MySQL',
                    connectionDetails: { host: 'legacy-db.internal', database: 'knowledge_old' }
                },
                target: {
                    system: 'DKN',
                    connectionDetails: { endpoint: 'internal' }
                },
                status: 'InProgress',
                initiatedBy: createdUsers.admin,
                progress: { total: 500, processed: 234, failed: 5 },
                startedAt: new Date()
            }
        ];

        for (const migration of sampleMigrations) {
            await MigrationHandler.create(migration);
            console.log(`  Created migration: ${migration.name} (${migration.status})`);
        }

        // Create sample mentorships
        console.log('Creating sample mentorships...');
        await Mentorship.deleteMany({});

        const mentorshipData = [
            {
                mentor: createdUsers.champion,
                mentee: createdUsers.consultant,
                status: 'Active',
                focusAreas: ['Best Practices', 'Content Quality'],
                goals: [
                    { description: 'Learn validation workflow', completed: true, completedAt: new Date() },
                    { description: 'Create 5 knowledge items', completed: false }
                ],
                sessions: [
                    { date: new Date(), duration: 30, notes: 'Introduction to DKN platform', topics: ['Navigation', 'Upload Process'] }
                ]
            },
            {
                mentor: createdUsers.governance,
                mentee: createdUsers.manager,
                status: 'Active',
                focusAreas: ['Governance', 'Compliance'],
                goals: [
                    { description: 'Understand compliance requirements', completed: false }
                ]
            }
        ];

        for (const mentorship of mentorshipData) {
            await Mentorship.create(mentorship);
            console.log(`  Created mentorship: ${mentorship.mentor} -> ${mentorship.mentee}`);
        }

        // Create sample training modules
        console.log('Creating sample training modules...');
        await TrainingModule.deleteMany({});
        await TrainingProgress.deleteMany({});

        const trainingModules = [
            {
                title: 'DKN Platform Onboarding',
                description: 'Complete introduction to the Digital Knowledge Network platform. Learn to navigate, search, upload, and collaborate.',
                category: 'Onboarding',
                difficulty: 'Beginner',
                estimatedDuration: 45,
                content: [
                    { type: 'Video', title: 'Welcome to DKN', url: '#', duration: 5, order: 1 },
                    { type: 'Document', title: 'Platform Overview', url: '#', duration: 10, order: 2 },
                    { type: 'Interactive', title: 'Navigating the Dashboard', url: '#', duration: 15, order: 3 },
                    { type: 'Quiz', title: 'Knowledge Check', url: '#', duration: 10, order: 4 }
                ],
                tags: ['onboarding', 'basics', 'getting-started'],
                targetRoles: ['All'],
                isPublished: true,
                createdBy: createdUsers.admin
            },
            {
                title: 'Knowledge Upload Best Practices',
                description: 'Learn how to create high-quality knowledge items that get approved quickly and help colleagues.',
                category: 'Process',
                difficulty: 'Intermediate',
                estimatedDuration: 30,
                content: [
                    { type: 'Document', title: 'Writing Effective Titles', url: '#', duration: 5, order: 1 },
                    { type: 'Document', title: 'Creating Searchable Descriptions', url: '#', duration: 10, order: 2 },
                    { type: 'Video', title: 'Tagging Strategies', url: '#', duration: 10, order: 3 },
                    { type: 'Quiz', title: 'Best Practices Quiz', url: '#', duration: 5, order: 4 }
                ],
                tags: ['upload', 'quality', 'best-practices'],
                targetRoles: ['Consultant', 'Project Manager'],
                isPublished: true,
                createdBy: createdUsers.admin
            },
            {
                title: 'Knowledge Validation Training',
                description: 'Training for Knowledge Champions on how to review, validate, and provide constructive feedback.',
                category: 'Process',
                difficulty: 'Advanced',
                estimatedDuration: 60,
                content: [
                    { type: 'Video', title: 'Role of Knowledge Champion', url: '#', duration: 10, order: 1 },
                    { type: 'Document', title: 'Quality Criteria', url: '#', duration: 15, order: 2 },
                    { type: 'Interactive', title: 'Review Simulation', url: '#', duration: 25, order: 3 },
                    { type: 'Quiz', title: 'Certification Exam', url: '#', duration: 10, order: 4 }
                ],
                tags: ['validation', 'review', 'champion'],
                targetRoles: ['Knowledge Champion', 'Administrator'],
                isPublished: true,
                createdBy: createdUsers.admin
            }
        ];

        for (const module of trainingModules) {
            const created = await TrainingModule.create(module);
            console.log(`  Created training: ${module.title}`);

            // Enroll consultant in first module with some progress
            if (module.title === 'DKN Platform Onboarding') {
                await TrainingProgress.create({
                    user: createdUsers.consultant,
                    module: created._id,
                    status: 'InProgress',
                    progress: 50,
                    completedContent: [
                        { contentIndex: 0, completedAt: new Date() },
                        { contentIndex: 1, completedAt: new Date() }
                    ],
                    startedAt: new Date()
                });
            }
        }

        console.log('\n✅ Seeding completed successfully!');
        console.log('\n📧 Test Accounts:');
        console.log('  Consultant:         consultant@dkn.com / password123');
        console.log('  Knowledge Champion: champion@dkn.com / password123');
        console.log('  Project Manager:    manager@dkn.com / password123');
        console.log('  Administrator:      admin@dkn.com / 123456');
        console.log('  Governance Council: governance@dkn.com / password123');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();

