const request = require("supertest");
const app = require("../app");

jest.mock('../db/ForumsService.js', () => ({
    fetchAllForums: jest.fn().mockResolvedValue([
        { id: 'forum1', title: 'Test Forum', content: 'Content', createdBy: 'testuser', likes: 0 }
    ]),
    createForum: jest.fn().mockResolvedValue('forum1'),
    likeForumPost: jest.fn().mockResolvedValue(true),
    fetchForumComments: jest.fn().mockResolvedValue([]),
    addCommentToForum: jest.fn().mockResolvedValue('comment1'),
    likeForumComment: jest.fn().mockResolvedValue(true),
}));

jest.mock('firebase/firestore', () => ({
    deleteDoc: jest.fn().mockResolvedValue(),
    doc: jest.fn(),
}));

jest.mock('../firebase.js', () => ({
    db: {},
}));

describe("Forum Routes", () => {

    // GET /api/forums
    describe("GET /api/forums", () => {
        test("returns 200 and an array", async() => {
            const res = await request(app).get("/api/forums");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        test("returns 200 when search query provided (client-side filter)", async() => {
            const res = await request(app).get("/api/forums?search=test");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // GET /:id
    describe("GET /api/forums/:id", () => {
        test("returns 200 and a forum object for valid id", async () => {
            const res = await request(app).get("/api/forums/forum1");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("id");
        });

        test("returns 404 for invalid id", async () => {
            const res = await request(app).get("/api/forums/fakeid123");
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("message", "Forum not found");
        });
    });

    // POST /api/forums
    describe("POST /api/forums", () => {
        test("returns 201 and creates forum with valid data", async () => {
            const res = await request(app).post("/api/forums").send({
                title: "Test Forum",
                content: "This is a test forum post",
                createdBy: "testuser",
                creatorId: "testuser123"
            });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
        });

        test("returns 400 when missing required fields", async () => {
            const res = await request(app).post("/api/forums").send({
                title: "Missing content and createdBy"
            });
            expect(res.status).toBe(400);
        });
    });

    // DELETE /:id
    describe("DELETE /api/forums/:id", () => {
        test("returns 200 and deletes forum", async () => {
            const res = await request(app).delete("/api/forums/forum1");
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Forum deleted successfully");
        });
    });

    // PATCH /:id/like
    describe("PATCH /api/forums/:id/like", () => {
        test("returns 200 and likes a forum post", async () => {
            const res = await request(app)
                .patch("/api/forums/forum1/like")
                .send({ userId: "testuser" });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Like updated");
        });
    });

    // GET /:id/comments
    describe("GET /api/forums/:id/comments", () => {
        test("returns 200 and an array of comments", async () => {
            const res = await request(app).get("/api/forums/forum1/comments");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // POST /:id/comments
    describe("POST /api/forums/:id/comments", () => {
        test("returns 201 and creates comment with valid data", async () => {
            const res = await request(app)
                .post("/api/forums/forum1/comments")
                .send({ authorId: "testuser", comment: "Great post!" });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
        });

        test("returns 400 when missing required fields", async () => {
            const res = await request(app)
                .post("/api/forums/forum1/comments")
                .send({});
            expect(res.status).toBe(400);
        });
    });

    // PATCH /:id/comments/:commentId/like
    describe("PATCH /api/forums/:id/comments/:commentId/like", () => {
        test("returns 200 and likes a comment", async () => {
            const res = await request(app).patch(
                "/api/forums/forum1/comments/comment1/like"
            ).send({ userId: "testuser" });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Comment like updated");
        });
    });

    // DELETE /:id/comments/:commentId
    describe("DELETE /api/forums/:id/comments/:commentId", () => {
        test("returns 200 and deletes a comment", async () => {
            const res = await request(app).delete(
                "/api/forums/forum1/comments/comment1"
            );
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Comment deleted successfully");
        });
    });
});