```javascript
// Filename: ProjectBackend/src/app.js
// Test Summary: Test the application's ability to handle cross-origin requests with credentials.
// Purpose: Verify that the CORS middleware is configured correctly to allow requests from the specified `CORS_ORIGIN` and supports credentials.

import express from 'express';
import cors from 'cors';

// Mock CORS_ORIGIN for deterministic testing
const CORS_ORIGIN = 'http://localhost:3000';

const app = express();

// Configure CORS middleware
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
}));

// Example route to test
app.get('/test', (req, res) => {
    res.json({ message: 'Success' });
});

// Export app for testing
export default app;
```

```javascript
// Filename: ProjectBackend/src/app.test.js
// Test Summary: Test the application's ability to handle cross-origin requests with credentials.
// Purpose: Verify that the CORS middleware is configured correctly to allow requests from the specified `CORS_ORIGIN` and supports credentials.

import request from 'supertest';
import app from './app'; // Import the app from app.js

// Mock CORS_ORIGIN for testing purposes
const MOCK_CORS_ORIGIN = 'http://localhost:3000';
const ANOTHER_ORIGIN = 'http://otherdomain.com';
const INVALID_ORIGIN = 'http://invalid.com';

describe('CORS Middleware', () => {
    it('should allow requests from the specified origin with credentials', async () => {
        await request(app)
            .get('/test')
            .set('Origin', MOCK_CORS_ORIGIN)
            .set('Cookie', 'test_cookie=value') // Simulate a request with credentials
            .expect('Access-Control-Allow-Origin', MOCK_CORS_ORIGIN)
            .expect('Access-Control-Allow-Credentials', 'true')
            .expect(200);
    });

    it('should not allow requests from an unauthorized origin without credentials', async () => {
        await request(app)
            .get('/test')
            .set('Origin', ANOTHER_ORIGIN)
            .expect(function(res) {
                // Expect Access-Control-Allow-Origin to not be the unauthorized origin,
                // or for it to be absent if credentials are not involved.
                // With credentials: true and origin set, an unauthorized origin should
                // result in a CORS preflight failure or no CORS headers in a simple request.
                // Supertest's default behavior for non-matching CORS origins without preflight
                // is often a 404 or an actual error response from the server if no matching route.
                // However, for CORS it's more about the headers.
                // If the origin is not allowed, the browser will block the request.
                // For a simple GET request, if the origin isn't in the `allow` list,
                // the `Access-Control-Allow-Origin` header might be missing or set to null.
                // The crucial part is that the browser would reject it due to the mismatch.

                // Let's check for the absence or a different value in Access-Control-Allow-Origin
                // or the absence of Access-Control-Allow-Credentials.
                if (res.headers['access-control-allow-origin'] === ANOTHER_ORIGIN) {
                    throw new Error('Expected Access-Control-Allow-Origin not to be the unauthorized origin');
                }
                if (res.headers['access-control-allow-credentials'] === 'true') {
                    throw new Error('Expected Access-Control-Allow-Credentials to not be true for unauthorized origin');
                }
            })
            .expect(200); // The server itself might still respond if not configured to reject early.
                        // The test here focuses on the CORS headers.
    });

    it('should reject requests from an origin that is not explicitly allowed', async () => {
        await request(app)
            .get('/test')
            .set('Origin', INVALID_ORIGIN)
            .set('Cookie', 'test_cookie=value') // Simulate credentials
            .expect(function(res) {
                // If the origin is not explicitly allowed, the browser will block it.
                // The server might still return a 200, but the CORS headers will be missing
                // or incorrect according to the browser's CORS policy.
                // We expect that 'Access-Control-Allow-Origin' will not match the invalid origin.
                // And 'Access-Control-Allow-Credentials' should not be 'true' for an invalid origin.
                if (res.headers['access-control-allow-origin'] && res.headers['access-control-allow-origin'] !== '*') {
                     if (res.headers['access-control-allow-origin'] !== INVALID_ORIGIN) {
                         // This is the expected behavior: header is absent or not matching
                     } else {
                         throw new Error('Expected Access-Control-Allow-Origin not to match the invalid origin');
                     }
                } else if (!res.headers['access-control-allow-origin']) {
                    // Header is absent, which is also expected for disallowed origins with credentials
                }


                if (res.headers['access-control-allow-credentials'] === 'true') {
                    throw new Error('Expected Access-Control-Allow-Credentials to not be true for invalid origin');
                }
            })
            .expect(200); // The route itself might still process the request, the CORS aspect is about headers.
    });

    // Edge case: Request without Origin header (should not be affected by CORS origin check)
    it('should process requests without an Origin header', async () => {
        await request(app)
            .get('/test')
            .expect(200);
    });

    // Edge case: Preflight request with unauthorized origin
    it('should respond to preflight requests from the allowed origin', async () => {
        await request(app)
            .options('/test')
            .set('Origin', MOCK_CORS_ORIGIN)
            .set('Access-Control-Request-Method', 'GET')
            .set('Access-Control-Request-Headers', 'content-type, authorization, cookie')
            .expect('Access-Control-Allow-Origin', MOCK_CORS_ORIGIN)
            .expect('Access-Control-Allow-Credentials', 'true')
            .expect('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
            .expect('Access-Control-Allow-Headers', 'content-type, authorization, cookie')
            .expect(204); // Preflight requests typically respond with 204
    });

    it('should not respond to preflight requests from an unauthorized origin', async () => {
        await request(app)
            .options('/test')
            .set('Origin', ANOTHER_ORIGIN)
            .set('Access-Control-Request-Method', 'GET')
            .set('Access-Control-Request-Headers', 'content-type, authorization, cookie')
            .expect(function(res) {
                // For unauthorized origins, the CORS headers should indicate denial.
                // Access-Control-Allow-Origin should not match the unauthorized origin.
                if (res.headers['access-control-allow-origin'] === ANOTHER_ORIGIN) {
                    throw new Error('Expected Access-Control-Allow-Origin not to be the unauthorized origin for preflight');
                }
                if (res.headers['access-control-allow-credentials'] === 'true') {
                    throw new Error('Expected Access-Control-Allow-Credentials to not be true for unauthorized origin in preflight');
                }
            })
            .expect(204); // Preflight requests typically respond with 204, but the headers are key.
                         // If the server logic explicitly blocks unauthorized origins, it might error differently.
                         // For cors middleware, it typically means the header won't be present or will be '*' if no specific origin is allowed.
    });
});
```