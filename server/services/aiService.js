// AI/NLP Service Stubs
// In production, these would call a Python/FastAPI microservice or OpenAI API

const KnowledgeItem = require('../models/KnowledgeItem');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');

// Generate tags from text using NLP
const generateTags = async (text) => {
    // Mock NLP extraction - in production, call external AI service
    const keywords = text.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
    const filtered = keywords.filter(word =>
        word.length > 3 && !commonWords.includes(word)
    ).slice(0, 10);

    // Mock AI-generated tags
    const mockTags = ['Strategy', 'Enterprise', 'Digital Transformation', 'Cloud', 'Innovation'];
    return [...new Set([...filtered.slice(0, 3), ...mockTags.slice(0, 3)])];
};

// Check similarity with existing content
const checkSimilarity = async (text, excludeId = null) => {
    try {
        // Mock cosine similarity - in production, use embeddings + vector search
        const existingItems = await KnowledgeItem.find({
            _id: { $ne: excludeId },
            status: { $in: ['Approved', 'Pending'] }
        }).limit(100);

        let maxScore = 0;
        let similarItems = [];

        for (const item of existingItems) {
            // Simple Jaccard similarity mock
            const itemWords = new Set(item.description.toLowerCase().split(/\s+/));
            const inputWords = new Set(text.toLowerCase().split(/\s+/));
            const intersection = [...itemWords].filter(x => inputWords.has(x));
            const union = new Set([...itemWords, ...inputWords]);
            const score = intersection.length / union.size;

            if (score > 0.3) {
                similarItems.push(item._id);
                if (score > maxScore) maxScore = score;
            }
        }

        return {
            isDuplicate: maxScore > 0.8,
            score: maxScore,
            similarItems: similarItems.slice(0, 5)
        };
    } catch (error) {
        console.error('Similarity check error:', error);
        return { isDuplicate: false, score: 0, similarItems: [] };
    }
};

// Get personalized recommendations for a user
const getRecommendations = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return [];

        // Get user's skills and region for matching
        const userSkills = user.skills || [];
        const userRegion = user.region;

        // Find relevant content based on user profile
        let query = { status: 'Approved' };
        if (userSkills.length > 0) {
            query.$or = [
                { tags: { $in: userSkills } },
                { category: { $in: userSkills } }
            ];
        }

        const items = await KnowledgeItem.find(query)
            .sort({ views: -1, createdAt: -1 })
            .limit(10);

        // Generate recommendation scores
        const recommendations = items.map(item => {
            let score = 0.5; // Base score

            // Boost for matching region
            if (item.region === userRegion) score += 0.2;

            // Boost for matching skills/tags
            const matchingTags = item.tags.filter(tag => userSkills.includes(tag));
            score += matchingTags.length * 0.1;

            return {
                item: item._id,
                score: Math.min(score, 1),
                reason: matchingTags.length > 0
                    ? `Matches your skills: ${matchingTags.join(', ')}`
                    : 'Trending in your region'
            };
        });

        return recommendations.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Recommendations error:', error);
        return [];
    }
};

// Map user expertise based on their contributions
const mapExpertise = async (userId) => {
    try {
        const contributions = await KnowledgeItem.find({
            author: userId,
            status: 'Approved'
        });

        // Extract domains from contributions
        const domains = [...new Set(contributions.map(c => c.category))];
        const allTags = contributions.flatMap(c => c.tags);
        const tagCounts = allTags.reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {});

        // Top 5 tags as strengths
        const strengths = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag]) => tag);

        return {
            domains,
            strengths,
            growthAreas: ['AI/ML', 'Cloud Architecture', 'Data Analytics'] // Mock suggestions
        };
    } catch (error) {
        console.error('Expertise mapping error:', error);
        return { domains: [], strengths: [], growthAreas: [] };
    }
};

// Identify skill gaps for a user
const identifySkillGaps = async (userId) => {
    try {
        const user = await User.findById(userId);
        const userSkills = user?.skills || [];

        // Mock trending skills in the organization
        const trendingSkills = [
            { skill: 'AI/ML', requiredLevel: 3 },
            { skill: 'Cloud Architecture', requiredLevel: 4 },
            { skill: 'Data Analytics', requiredLevel: 3 },
            { skill: 'Agile Methodology', requiredLevel: 4 },
            { skill: 'Cybersecurity', requiredLevel: 3 }
        ];

        // Identify gaps
        const gaps = trendingSkills
            .filter(ts => !userSkills.includes(ts.skill))
            .map(ts => ({
                skill: ts.skill,
                currentLevel: 0,
                requiredLevel: ts.requiredLevel,
                suggestedResources: [] // Would populate with relevant KnowledgeItems
            }));

        return gaps;
    } catch (error) {
        console.error('Skill gaps error:', error);
        return [];
    }
};

// Detect outdated content
const detectOutdatedContent = async () => {
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const outdatedItems = await KnowledgeItem.find({
            status: 'Approved',
            updatedAt: { $lt: oneYearAgo }
        }).select('_id title updatedAt');

        return outdatedItems.map(item => ({
            itemId: item._id,
            title: item.title,
            lastUpdated: item.updatedAt,
            recommendation: 'Review for accuracy and relevance'
        }));
    } catch (error) {
        console.error('Outdated detection error:', error);
        return [];
    }
};

// Detect redundant content
const detectRedundantContent = async () => {
    try {
        const items = await KnowledgeItem.find({ status: 'Approved' });
        const redundantPairs = [];

        // Simple pairwise comparison (in production, use embeddings)
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const similarity = await checkSimilarity(items[i].description, items[i]._id);
                if (similarity.score > 0.7 && similarity.similarItems.includes(items[j]._id)) {
                    redundantPairs.push({
                        item1: { id: items[i]._id, title: items[i].title },
                        item2: { id: items[j]._id, title: items[j].title },
                        similarityScore: similarity.score,
                        recommendation: 'Consider merging or archiving duplicate'
                    });
                }
            }
            if (redundantPairs.length >= 10) break; // Limit for performance
        }

        return redundantPairs;
    } catch (error) {
        console.error('Redundancy detection error:', error);
        return [];
    }
};

// Generate summary for content
const generateSummary = async (text) => {
    // Mock summary generation - in production, use LLM
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).join('. ') + '.';
};

module.exports = {
    generateTags,
    checkSimilarity,
    getRecommendations,
    mapExpertise,
    identifySkillGaps,
    detectOutdatedContent,
    detectRedundantContent,
    generateSummary
};
