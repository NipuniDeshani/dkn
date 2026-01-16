class ConfigurationManager {
    constructor() {
        // Default configuration
        this.config = {
            maxUploadSize: 10 * 1024 * 1024, // 10MB
            allowedFileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
            featureFlags: {
                enableAI: true,
                enableLeaderboard: true
            }
        };
    }

    /**
     * Get a configuration value by key
     * @param {string} key - e.g., 'maxUploadSize' or 'featureFlags.enableAI'
     * @returns {any} Config value
     */
    getConfig(key) {
        if (!key) return this.config;

        const keys = key.split('.');
        let result = this.config;
        for (const k of keys) {
            if (result && result[k] !== undefined) {
                result = result[k];
            } else {
                return undefined;
            }
        }
        return result;
    }

    /**
     * Update a configuration value dynamically
     * @param {string} key 
     * @param {any} value 
     */
    updateConfig(key, value) {
        // Simple mock update (memory only)
        // In real app, persist to DB or Redis
        const keys = key.split('.');
        let obj = this.config;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        console.log(`Configuration updated: ${key} = ${value}`);
        return true;
    }
}

module.exports = new ConfigurationManager();
