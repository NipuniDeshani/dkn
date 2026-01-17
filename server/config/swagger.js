const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DKN - Digital Knowledge Network API',
            version: '1.0.0',
            description: `
## Enterprise Knowledge Management Platform

DKN is a comprehensive knowledge management system designed for enterprise teams.

### Features
- **Knowledge Management**: Upload, validate, and share knowledge items
- **Role-Based Access Control**: 5 distinct roles with granular permissions
- **Gamification**: Leaderboard with points system
- **AI Recommendations**: Personalized content suggestions
- **Data Migration**: Import legacy data from external systems
- **Mentorship & Training**: Learning management features

### Authentication
All protected endpoints require a valid JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-token>
\`\`\`
            `
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development Server'
            }
        ],
        tags: [
            { name: 'Authentication', description: 'User authentication and authorization' },
            { name: 'Knowledge', description: 'Knowledge item management' },
            { name: 'Dashboard', description: 'Dashboard statistics and data' },
            { name: 'Validation', description: 'Content validation workflow' },
            { name: 'Leaderboard', description: 'Gamification and rankings' },
            { name: 'Manager', description: 'Project Manager specific operations' },
            { name: 'Admin', description: 'Administrator operations' },
            { name: 'Recommendations', description: 'AI-powered content recommendations' },
            { name: 'Audit', description: 'Audit log management' },
            { name: 'Migration', description: 'Data migration operations' },
            { name: 'Configuration', description: 'System configuration' },
            { name: 'Mentorship', description: 'Mentorship program management' },
            { name: 'Training', description: 'Training modules and courses' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token obtained from /api/auth/login'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        username: { type: 'string', example: 'john_doe' },
                        email: { type: 'string', example: 'john@dkn.com' },
                        role: {
                            type: 'string',
                            enum: ['Consultant', 'Knowledge Champion', 'Project Manager', 'Administrator', 'Governance Council'],
                            example: 'Consultant'
                        },
                        region: { type: 'string', example: 'North America' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                KnowledgeItem: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string', example: 'Best Practices for React Development' },
                        description: { type: 'string' },
                        category: { type: 'string', example: 'Development' },
                        tags: { type: 'array', items: { type: 'string' } },
                        status: {
                            type: 'string',
                            enum: ['Pending', 'Approved', 'Rejected', 'Revision Requested'],
                            example: 'Pending'
                        },
                        author: { $ref: '#/components/schemas/User' },
                        views: { type: 'integer', example: 150 },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Migration: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string', example: 'Legacy SharePoint Import' },
                        sourceSystem: { type: 'string', example: 'SharePoint' },
                        status: {
                            type: 'string',
                            enum: ['Pending', 'In Progress', 'Completed', 'Failed', 'Cancelled'],
                            example: 'Pending'
                        },
                        recordCount: { type: 'integer', example: 1500 },
                        createdBy: { $ref: '#/components/schemas/User' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message here' }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation completed successfully' }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'User does not have permission to access this resource',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
