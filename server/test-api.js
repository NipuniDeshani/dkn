const API_URL = 'http://localhost:5000/api';
let authToken = '';

async function login() {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'consultant@dkn.com',
                password: 'password123'
            })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Status ${res.status}: ${err}`);
        }

        const data = await res.json();
        authToken = data.token;
        console.log('✅ Login successful');
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        process.exit(1);
    }
}

async function testValidationFailure() {
    console.log('\n--- Testing Validation Service (Expect Failure) ---');
    try {
        const res = await fetch(`${API_URL}/knowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: '', // Missing title
                description: 'Some desc',
                metadata: { category: 'IT' }
            })
        });

        if (res.status === 400) {
            const data = await res.json();
            console.log('✅ Validation check PASSED:', data.message);
        } else {
            console.error('❌ Validation check FAILED. Status:', res.status);
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

async function testGovernanceFailure() {
    console.log('\n--- Testing Governance Service (Expect Policy Violation) ---');
    try {
        const res = await fetch(`${API_URL}/knowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: 'Project Alpha Confidential Report',
                description: 'Secret data',
                metadata: {
                    category: 'IT',
                    tags: ['secret'],
                    author: 'Me'
                }
            })
        });

        if (res.status === 403) {
            const data = await res.json();
            console.log('✅ Governance check PASSED:', data.message);
        } else {
            console.error('❌ Governance check FAILED. Status:', res.status);
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

async function testSuccessWithAutoTagging() {
    console.log('\n--- Testing Success with NLP Auto-Tagging ---');
    try {
        const res = await fetch(`${API_URL}/knowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: 'Valid Knowledge Item ' + Date.now(),
                description: 'This is a valid document about cloud computing and reactjs development.',
                metadata: {
                    category: 'Development',
                    tags: [], // Empty tags to trigger auto-tagging
                    author: 'Me'
                }
            })
        });

        if (res.ok) {
            const item = await res.json();
            console.log('✅ Upload successful');
            console.log('   Generated Tags:', item.tags);
            if (item.tags.length > 0) {
                console.log('   ✅ NLP Auto-tagging Verified');
            } else {
                console.warn('   ⚠️ No tags were generated');
            }
        } else {
            const err = await res.text();
            console.error('❌ Upload failed. Status:', res.status, err);
        }
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
    }
}

async function run() {
    await login();
    await testValidationFailure();
    await testGovernanceFailure();
    await testSuccessWithAutoTagging();
}

run();
