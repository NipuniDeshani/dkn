const RecommendationEngine = require('./services/RecommendationEngine');
const NLPProcessor = require('./services/NLPProcessor');
const GovernanceService = require('./services/GovernanceService');
const MigrationHandler = require('./services/MigrationHandler');
const ConfigurationManager = require('./services/ConfigurationManager');
const ValidationService = require('./services/ValidationService');

console.log('Verifying Services...');

try {
    if (RecommendationEngine) console.log('✅ RecommendationEngine loaded');
    if (NLPProcessor) console.log('✅ NLPProcessor loaded');
    if (GovernanceService) console.log('✅ GovernanceService loaded');
    if (MigrationHandler) console.log('✅ MigrationHandler loaded');
    if (ConfigurationManager) console.log('✅ ConfigurationManager loaded');
    if (ValidationService) console.log('✅ ValidationService loaded');

    // Quick method check
    console.log('Testing ConfigurationManager.getConfig:', ConfigurationManager.getConfig('maxUploadSize'));

    console.log('All services verified successfully.');
} catch (error) {
    console.error('Service verification failed:', error);
    process.exit(1);
}
