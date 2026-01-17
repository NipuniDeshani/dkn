const KnowledgeItem = require('../models/KnowledgeItem');
const Validation = require('../models/ValidationWorkflow');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateTags, checkSimilarity } = require('../services/aiService');
const RecommendationEngine = require('../services/RecommendationEngine');
const NLPProcessor = require('../services/NLPProcessor');
const ValidationService = require('../services/ValidationService');
const GovernanceService = require('../services/GovernanceService');

// @desc    Upload new knowledge
// @route   POST /api/knowledge
// @access  Private (All authenticated users)
const uploadKnowledge = async (req, res) => {
    try {
        const { title, description, category, region, contentUrl, metadata } = req.body;
        let tags = req.body.tags;

        // Process attachments
        console.log('DEBUG: req.files:', req.files);
        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => {
                console.log('DEBUG: Processing file:', file);
                return {
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
                };
            });
            console.log('DEBUG: Mapped attachments:', attachments);
        }

        // Handle tags from FormData (might be string or array)
        if (typeof tags === 'string') {
            try {
                // Try parsing as JSON first (if sent as validated string array)
                tags = JSON.parse(tags);
            } catch (e) {
                // If not JSON, split by comma
                tags = tags.split(',').map(tag => tag.trim()).filter(t => t);
            }
        }

        // 1. Validation Service integration
        const contentValidation = ValidationService.validateContent({ title, description });
        if (!contentValidation.isValid) {
            return res.status(400).json({ message: 'Content validation failed', errors: contentValidation.errors });
        }

        // Build metadata object from top-level fields for validation
        // Note: author is always req.user._id; category comes from body; tags may be empty (we generate them)
        const metadataForValidation = {
            category,
            tags: tags || [],
            author: req.user._id
        };
        const metadataValidation = ValidationService.validateMetadata(metadataForValidation);
        if (!metadataValidation.isValid) {
            return res.status(400).json({ message: 'Metadata validation failed', errors: metadataValidation.errors });
        }

        // 2. Governance Service integration
        // Note: metadata might be a JSON string if sent via FormData
        let parsedMetadata = metadata;
        if (typeof metadata === 'string') {
            try {
                parsedMetadata = JSON.parse(metadata);
            } catch (e) {
                parsedMetadata = {};
            }
        }

        const policyCheck = await GovernanceService.enforcePolicy({ title, description, ...parsedMetadata });
        if (!policyCheck.valid) {
            await GovernanceService.auditAction({ type: 'POLICY_VIOLATION', user: req.user._id, violations: policyCheck.violations });
            return res.status(403).json({ message: 'Policy violation', violations: policyCheck.violations });
        }

        // 3. NLP & AI enhancements
        // Use NLPProcessor for keyword extraction if tags are missing
        let processedTags = tags;
        if (!processedTags || processedTags.length === 0) {
            processedTags = await NLPProcessor.extractKeywords(description);
        }
        // Fallback to existing AI service if needed, or Combine
        // const aiTags = await generateTags(description); 

        const nlpAnalysis = await NLPProcessor.analyzeText(description);
        const similarity = await checkSimilarity(description);

        // BUSINESS RULE: No duplicate knowledge uploads
        if (similarity && similarity.isDuplicate) {
            return res.status(409).json({
                message: 'Duplicate content detected',
                similarityScore: similarity.score,
                similarItems: similarity.similarItems
            });
        }

        const knowledgeItem = await KnowledgeItem.create({
            title,
            description,
            category, // FormData fields are strings
            region,
            contentUrl,
            metadata: parsedMetadata,
            attachments: attachments,
            tags: processedTags,
            author: req.user._id,
            status: 'Pending',
            aiAnalysis: {
                keywords: processedTags,
                sentiment: nlpAnalysis ? nlpAnalysis.sentiment : 'neutral',
                duplicateScore: similarity ? similarity.score : 0,
                similarItems: similarity && similarity.similarItems ? similarity.similarItems : []
            }
        });

        // Auto-assign to a Knowledge Champion for validation
        let assignedReviewer = null;
        const champions = await User.find({ role: 'Knowledge Champion' });
        if (champions.length > 0) {
            // Simple round-robin assignment
            const randomIndex = Math.floor(Math.random() * champions.length);
            assignedReviewer = champions[randomIndex]._id;
        }

        // Create a Validation record for the new knowledge item
        await Validation.create({
            knowledgeItem: knowledgeItem._id,
            assignedReviewer: assignedReviewer,
            status: 'Pending',
            priority: 'Medium',
            reviewHistory: [{
                reviewer: req.user._id,
                action: 'Assigned',
                comment: 'New upload submitted for review'
            }]
        });

        await AuditLog.create({
            action: 'KNOWLEDGE_UPLOAD',
            actor: req.user._id,
            target: knowledgeItem._id,
            targetModel: 'KnowledgeItem'
        });

        res.status(201).json(knowledgeItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all knowledge items (with filters)
// @route   GET /api/knowledge
// @access  Private
const getKnowledgeItems = async (req, res) => {
    try {
        const { search, category, status, flagged, author } = req.query;
        let query = {};

        if (search) {
            query.$text = { $search: search };
        }
        if (category) {
            query.category = category;
        }
        if (author) {
            query.author = author;
        }

        // Quality Flag Filter (UC08)
        if (flagged === 'true') {
            query.qualityFlag = true;
        }

        // RBAC Logic for status visibility
        if (req.user.role === 'Consultant') {
            // Consultants only see Approved content, or their own Pending items
            query.$or = [
                { status: 'Approved' },
                { author: req.user._id }
            ];
        } else if (['Knowledge Champion', 'Administrator', 'Governance Council'].includes(req.user.role)) {
            // Approvers can see Pending content
            // If specific status requested used it
            if (status) {
                query.status = status;
            }
            // If looking for flagged items, don't default to Pending (flagged items can be Approved)
            else if (!flagged) {
                // Default to Pending only if NOT looking for flagged
                // Actually, let's keep it safe: if no status and no flag, return Pending?
                // Or validation queue fetches by status=Pending explicitly.
                // So we can leave this open if flagged is true?
                // Let's say: if flagged is true, ignore default status restriction.
            }

            if (!status && !flagged) {
                // Default behavior for generic fetch: usually for validation queue we pass status=Pending
                // But for "All Knowledge" view?
                // Let's match previous behavior: if no status, maybe fetch all? 
                // Previous code: "if (status) query.status = status; else { query.status='Approved' ?? No }"
                // Previous code didn't set default status for Champions! 
                // Wait. Lines 180-181: "if (status) query.status = status;"
                // It implied if status is undefined, fetch ALL?
                // No, line 182 "else query.status = 'Approved'" was for OTHER roles?
                // Line 178 checked Champion.
                // Line 180: if status provided, set it.
                // If NOT provided, it returned everything?
                // Yes.
            }
        } else {
            query.status = 'Approved';
        }

        // 4. Recommendation Engine integration
        if (req.query.recommendations === 'true') {
            const recommendations = await RecommendationEngine.getRecommendations(req.user._id);
            // If recommendations return specific items, we could filter by them or just return them directly
            // For now, let's assume we want to return the items found by the engine
            // If the engine returns full items, return them. If IDs, fetch them.
            // Our mock engine returns a list of Recommendation docs, we might want actual KnowledgeItems
            // Let's just return the standard query results for now, but logged/processed
            // In a full implementation: return await KnowledgeItem.find({ _id: { $in: recIds } });
        }

        const items = await KnowledgeItem.find(query).populate('author', 'username role'); // basic pagination omitted for brevity
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject Knowledge
// @route   PUT /api/knowledge/:id/approve
// @access  Private (Knowledge Champion Only)
const reviewKnowledge = async (req, res) => {
    try {
        const { status, comment } = req.body;
        const { id } = req.params;

        const item = await KnowledgeItem.findById(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (!['Approved', 'Rejected', 'Revision'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        item.status = status;
        item.approvals.push({
            approver: req.user._id,
            status: status === 'Revision' ? 'Request Changes' : status,
            comment
        });

        await item.save();

        await AuditLog.create({
            action: `KNOWLEDGE_${status.toUpperCase()}`,
            actor: req.user._id,
            target: item._id,
            targetModel: 'KnowledgeItem',
            details: { comment }
        });

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single knowledge item by ID
// @route   GET /api/knowledge/:id
// @access  Private
const getKnowledgeById = async (req, res) => {
    try {
        const item = await KnowledgeItem.findById(req.params.id)
            .populate('author', 'username role region')
            .populate('approvals.approver', 'username role')
            .populate('aiAnalysis.similarItems', 'title');

        if (!item) {
            return res.status(404).json({ message: 'Knowledge item not found' });
        }

        // Increment view count
        item.views = (item.views || 0) + 1;
        await item.save();

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update knowledge item (only by author)
// @route   PUT /api/knowledge/:id
// @access  Private (Author only)
const updateKnowledge = async (req, res) => {
    try {
        const { title, description, category, region, tags, contentUrl } = req.body;

        // Handle existingAttachments - parse from JSON string if needed
        let existingAttachments = [];
        if (req.body.existingAttachments) {
            try {
                existingAttachments = typeof req.body.existingAttachments === 'string'
                    ? JSON.parse(req.body.existingAttachments)
                    : req.body.existingAttachments;
            } catch (e) {
                console.error('Error parsing existingAttachments', e);
            }
        }

        let processedTags = tags;
        if (typeof tags === 'string') {
            try {
                processedTags = JSON.parse(tags);
            } catch (e) {
                processedTags = tags.split(',').map(tag => tag.trim()).filter(t => t);
            }
        }

        // Process new attachments
        let newAttachments = [];
        if (req.files && req.files.length > 0) {
            newAttachments = req.files.map(file => ({
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
            }));
        }

        const item = await KnowledgeItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Knowledge item not found' });
        }

        // Check if user is the author
        if (item.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized. Only the author can edit this item.' });
        }

        const previousStatus = item.status;

        // Update fields
        if (title) item.title = title;
        if (description) item.description = description;
        if (category) item.category = category;
        if (region) item.region = region;
        if (processedTags) item.tags = processedTags;
        if (contentUrl !== undefined) item.contentUrl = contentUrl;

        // Update attachments: Combine retained existing ones + new ones
        // If existingAttachments isn't provided (e.g. basic edit), keep what we have? 
        // No, frontend should send the valid list of existing attachment IDs/objects.
        // Simplified logic: If existingAttachments is provided, filter current item.attachments by those IDs (or just names/urls)
        // AND add newAttachments.

        // Strategy: Frontend sends 'existingAttachments' as a list of objects that correspond to what SHOULD BE kept.
        // We can just use that list directly, assuming it's valid, plus new ones.

        if (existingAttachments.length > 0 || newAttachments.length > 0 || req.body.clearAttachments) {
            // We need to be careful to trust existingAttachments, maybe valid them against what's in DB?
            // For simplicity, just use what frontend sends for retained files, plus new files.
            item.attachments = [...existingAttachments, ...newAttachments];
        }

        // Increment version on edit
        item.version = (item.version || 1) + 1;
        item.updatedAt = Date.now();

        // Set status to Pending for re-review when content changes
        // This ensures Knowledge Champion is notified of updates
        if (['Approved', 'Rejected', 'Revision'].includes(previousStatus)) {
            item.status = 'Pending';
        }

        await item.save();

        // Create or update validation for Knowledge Champion review
        if (previousStatus !== 'Pending') {
            // Find existing validation or create new one
            let validation = await Validation.findOne({ knowledgeItem: item._id });

            if (validation) {
                // Update existing validation
                validation.status = 'Pending';
                validation.reviewHistory.push({
                    reviewer: req.user._id,
                    action: 'Assigned',
                    comment: `Content updated (v${item.version}) - requires re-review`
                });
                await validation.save();
            } else {
                // Create new validation
                const champions = await User.find({ role: 'Knowledge Champion' });
                const reviewer = champions.length > 0
                    ? champions[Math.floor(Math.random() * champions.length)]._id
                    : null;

                await Validation.create({
                    knowledgeItem: item._id,
                    assignedReviewer: reviewer,
                    status: 'Pending',
                    priority: 'Medium',
                    reviewHistory: [{
                        reviewer: req.user._id,
                        action: 'Assigned',
                        comment: `Content updated (v${item.version}) - submitted for re-review`
                    }]
                });
            }
        }

        await AuditLog.create({
            action: 'KNOWLEDGE_UPDATED',
            actor: req.user._id,
            target: item._id,
            targetModel: 'KnowledgeItem',
            details: { version: item.version, previousStatus, newStatus: item.status }
        });

        const updatedItem = await KnowledgeItem.findById(item._id)
            .populate('author', 'username role region');

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manage Quality Flags (Champion/Governance)
// @route   PUT /api/knowledge/:id/quality
// @access  Private (Champion/Governance)
const manageQuality = async (req, res) => {
    try {
        const { id } = req.params;
        const { qualityFlag, qualityScore, qualityIssues, action } = req.body;

        // RBAC Check
        if (!['Knowledge Champion', 'Governance Council', 'Administrator'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to manage quality.' });
        }

        const item = await KnowledgeItem.findById(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (action === 'mark_safe') {
            item.qualityFlag = false;
            item.qualityScore = 100;
            item.qualityIssues = [];
        } else {
            if (typeof qualityFlag === 'boolean') item.qualityFlag = qualityFlag;
            if (qualityScore !== undefined) item.qualityScore = qualityScore;
            if (qualityIssues) item.qualityIssues = qualityIssues;
        }

        await item.save();

        await AuditLog.create({
            action: 'QUALITY_UPDATE',
            actor: req.user._id,
            target: item._id,
            targetModel: 'KnowledgeItem',
            details: { action, qualityFlag: item.qualityFlag }
        });

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Archive Knowledge (Champion/Admin only)
// @route   PUT /api/knowledge/:id/archive
// @access  Private
const archiveKnowledge = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await KnowledgeItem.findById(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.status = 'Archived';
        item.qualityFlag = false; // Clear flag if archived
        await item.save();

        await AuditLog.create({
            action: 'KNOWLEDGE_ARCHIVED',
            actor: req.user._id,
            target: item._id,
            targetModel: 'KnowledgeItem'
        });

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadKnowledge,
    getKnowledgeItems,
    reviewKnowledge,
    getKnowledgeById,
    updateKnowledge,
    manageQuality,
    archiveKnowledge
};
