class ValidationService {
    constructor() {
        // Validation rules
    }

    /**
     * Validate knowledge content integrity
     * @param {Object} content - The content object
     * @returns {Object} Validation result
     */
    validateContent(content) {
        const errors = [];
        if (!content) errors.push('Content is null');
        if (content && !content.title) errors.push('Title is missing');
        if (content && !content.description) errors.push('Description is missing');

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate metadata fields
     * @param {Object} metadata 
     * @returns {Object} Validation result
     */
    validateMetadata(metadata) {
        const errors = [];
        const requiredFields = ['category', 'tags', 'author'];

        for (const field of requiredFields) {
            if (!metadata || !metadata[field]) {
                errors.push(`Missing required metadata: ${field}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = new ValidationService();
