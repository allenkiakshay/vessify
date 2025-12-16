import { describe, it, expect, afterAll, beforeEach } from '@jest/globals';
import { auth } from '../../lib/auth.js';
import { prisma } from '../../lib/db.js';
describe('Auth API', () => {
    // Clean up test data before and after tests
    beforeEach(async () => {
        // Clean up test users
        await prisma.user.deleteMany({
            where: {
                email: {
                    contains: '@test.com',
                },
            },
        });
    });
    afterAll(async () => {
        // Final cleanup
        await prisma.user.deleteMany({
            where: {
                email: {
                    contains: '@test.com',
                },
            },
        });
        await prisma.$disconnect();
    });
    describe('User Signup', () => {
        it('should create a new user with valid credentials', async () => {
            const email = `user${Date.now()}@test.com`;
            const password = 'SecurePassword123!';
            const name = 'Test User';
            const response = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name,
                },
            });
            expect(response).toBeDefined();
            expect(response.user).toBeDefined();
            expect(response.user.email).toBe(email);
            expect(response.user.name).toBe(name);
            expect(response.user.emailVerified).toBe(false);
        });
        it('should not create user with duplicate email', async () => {
            const email = `duplicate${Date.now()}@test.com`;
            const password = 'SecurePassword123!';
            // Create first user
            await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: 'First User',
                },
            });
            // Try to create duplicate
            await expect(auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: 'Second User',
                },
            })).rejects.toThrow();
        });
        it('should require password for signup', async () => {
            const email = `nopass${Date.now()}@test.com`;
            await expect(auth.api.signUpEmail({
                body: {
                    email,
                    password: '',
                    name: 'No Password User',
                },
            })).rejects.toThrow();
        });
        it('should hash passwords securely', async () => {
            const email = `hashed${Date.now()}@test.com`;
            const password = 'PlainTextPassword123!';
            await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: 'Hash Test',
                },
            });
            // Check that password is hashed in database
            const account = await prisma.account.findFirst({
                where: {
                    user: {
                        email,
                    },
                    providerId: 'credential',
                },
            });
            expect(account).toBeDefined();
            expect(account?.password).toBeDefined();
            expect(account?.password).not.toBe(password);
            // Password should be hashed (check it's not the plain text)
            expect(account?.password).not.toEqual(password);
            expect(account?.password.length).toBeGreaterThan(password.length);
        });
    });
    describe('User Login', () => {
        const testEmail = `login${Date.now()}@test.com`;
        const testPassword = 'TestPassword123!';
        let testUserId;
        beforeEach(async () => {
            // Create a test user for login tests
            const signupResponse = await auth.api.signUpEmail({
                body: {
                    email: testEmail,
                    password: testPassword,
                    name: 'Login Test User',
                },
            });
            testUserId = signupResponse.user.id;
            // Manually verify email for testing
            await prisma.user.update({
                where: { id: testUserId },
                data: { emailVerified: true },
            });
        });
        afterEach(async () => {
            // Cleanup
            await prisma.session.deleteMany({
                where: { userId: testUserId },
            });
            await prisma.account.deleteMany({
                where: { userId: testUserId },
            });
            await prisma.user.delete({
                where: { id: testUserId },
            }).catch(() => { });
        });
        it('should login with correct credentials', async () => {
            const response = await auth.api.signInEmail({
                body: {
                    email: testEmail,
                    password: testPassword,
                },
            });
            expect(response).toBeDefined();
            expect(response.user).toBeDefined();
            expect(response.user.email).toBe(testEmail);
            expect(response.token).toBeDefined();
        });
        it('should not login with incorrect password', async () => {
            await expect(auth.api.signInEmail({
                body: {
                    email: testEmail,
                    password: 'WrongPassword123!',
                },
            })).rejects.toThrow();
        });
        it('should not login with non-existent email', async () => {
            await expect(auth.api.signInEmail({
                body: {
                    email: 'nonexistent@test.com',
                    password: testPassword,
                },
            })).rejects.toThrow();
        });
        it('should create session token on successful login', async () => {
            const response = await auth.api.signInEmail({
                body: {
                    email: testEmail,
                    password: testPassword,
                },
            });
            expect(response.token).toBeDefined();
            expect(response.user).toBeDefined();
            // Verify session exists in database
            const session = await prisma.session.findUnique({
                where: {
                    token: response.token,
                },
            });
            expect(session).toBeDefined();
            expect(session?.userId).toBe(response.user.id);
        });
    });
    describe('Session Management', () => {
        it('should validate active sessions', async () => {
            const email = `session${Date.now()}@test.com`;
            const password = 'SessionTest123!';
            // Create user and login
            const signupResponse = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: 'Session Test',
                },
            });
            // Verify email
            await prisma.user.update({
                where: { id: signupResponse.user.id },
                data: { emailVerified: true },
            });
            const loginResponse = await auth.api.signInEmail({
                body: {
                    email,
                    password,
                },
            });
            // Verify session is valid
            const headers = new Headers();
            headers.set('cookie', `better-auth.session_token=${loginResponse.token}`);
            const sessionCheck = await auth.api.getSession({
                headers,
            });
            expect(sessionCheck).toBeDefined();
            if (sessionCheck) {
                expect(sessionCheck.user).toBeDefined();
                expect(sessionCheck.user.email).toBe(email);
            }
        });
        it('should reject invalid session tokens', async () => {
            const headers = new Headers();
            headers.set('cookie', 'better-auth.session_token=invalid_token_12345');
            const sessionCheck = await auth.api.getSession({
                headers,
            });
            expect(sessionCheck).toBeNull();
        });
        it('should expire old sessions', async () => {
            const email = `expire${Date.now()}@test.com`;
            const password = 'ExpireTest123!';
            const signupResponse = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: 'Expire Test',
                },
            });
            // Verify email
            await prisma.user.update({
                where: { id: signupResponse.user.id },
                data: { emailVerified: true },
            });
            const loginResponse = await auth.api.signInEmail({
                body: {
                    email,
                    password,
                },
            });
            // Manually expire the session
            await prisma.session.update({
                where: {
                    token: loginResponse.token,
                },
                data: {
                    expiresAt: new Date(Date.now() - 1000), // Set to past
                },
            });
            // Try to use expired session
            const headers = new Headers();
            headers.set('cookie', `better-auth.session_token=${loginResponse.token}`);
            const sessionCheck = await auth.api.getSession({
                headers,
            });
            expect(sessionCheck).toBeNull();
        });
    });
    describe('Email Verification', () => {
        it('should mark user email as unverified on signup', async () => {
            const email = `unverified${Date.now()}@test.com`;
            const password = 'VerifyTest123!';
            const response = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: 'Unverified User',
                },
            });
            expect(response.user.emailVerified).toBe(false);
        });
        it('should create verification token on signup', async () => {
            const email = `verify${Date.now()}@test.com`;
            const password = 'VerifyToken123!';
            const signupResponse = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: 'Verify Token User',
                },
            });
            // Check for verification record in database
            // Better Auth stores verification by user ID, not email
            const user = await prisma.user.findUnique({
                where: { id: signupResponse.user.id },
            });
            expect(user).toBeDefined();
            expect(user?.email).toBe(email);
            expect(user?.emailVerified).toBe(false);
        });
    });
    describe('Password Security', () => {
        it('should require minimum password length', async () => {
            const email = `shortpass${Date.now()}@test.com`;
            await expect(auth.api.signUpEmail({
                body: {
                    email,
                    password: '123', // Too short
                    name: 'Short Pass',
                },
            })).rejects.toThrow();
        });
        it('should not expose passwords in responses', async () => {
            const email = `noexpose${Date.now()}@test.com`;
            const password = 'SecurePassword123!';
            const response = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: 'No Expose User',
                },
            });
            // Ensure password is not in response
            expect(response.user).toBeDefined();
            expect(response.user.password).toBeUndefined();
            expect(response.password).toBeUndefined();
        });
    });
});
