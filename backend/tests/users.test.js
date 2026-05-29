const request = require("supertest");
const app = require("../app");

jest.mock('../db/UsersService.js', () => ({
    fetchPublicUsers: jest.fn().mockResolvedValue([
        { id: 'user1', displayName: 'Test User', bio: 'Music lover', isPrivate: false }
    ]),
    fetchAllUsers: jest.fn().mockResolvedValue([
        { id: 'user1', displayName: 'Test User', bio: 'Music lover', isPrivate: false },
        { id: 'user2', displayName: 'Private User', bio: '', isPrivate: true }
    ]),
    userFromId: jest.fn().mockImplementation((id) => {
        if (id === 'user1') return Promise.resolve({ id: 'user1', displayName: 'Test User' });
        return Promise.resolve(null);
    }),
    saveUser: jest.fn().mockResolvedValue({ id: 'user1', displayName: 'Test User' }),
    updateUserProfile: jest.fn().mockResolvedValue(),
}));

describe("Users Routes", () => {

    // GET /api/users/discover
    describe("GET /api/users/discover", () => {
        test("returns 200 and array of public users", async () => {
            const res = await request(app).get("/api/users/discover");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // GET /api/users/all
    describe("GET /api/users/all", () => {
        test("returns 200 and array of all users", async () => {
            const res = await request(app).get("/api/users/all");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // GET /api/users/:id
    describe("GET /api/users/:id", () => {
        test("returns 200 and user object for valid id", async () => {
            const res = await request(app).get("/api/users/user1");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("id", "user1");
        });

        test("returns 404 for unknown user id", async () => {
            const res = await request(app).get("/api/users/doesnotexist");
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message", "User not found");
        });
    });

    // POST /api/users
    describe("POST /api/users", () => {
        test("returns 201 and saves user with valid data", async () => {
            const res = await request(app).post("/api/users").send({
                userId: "user1",
                displayName: "Test User",
                email: "test@test.com",
                spotifyId: "user1",
            });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
        });

        test("returns 400 when userId is missing", async () => {
            const res = await request(app).post("/api/users").send({
                displayName: "No ID User",
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message", "User ID is required");
        });
    });

    // PATCH /api/users/:id
    describe("PATCH /api/users/:id", () => {
        test("returns 200 and updates user profile", async () => {
            const res = await request(app).patch("/api/users/user1").send({
                bio: "Updated bio",
                isPrivate: true,
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Profile updated successfully");
        });
    });
});