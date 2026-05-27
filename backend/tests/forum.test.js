const request = require("supertest");
const app = require("../app");

describe("Forum Routes", () => {

    // GET /api/forums
    describe("GET /api/forums", () => {
        test("returns 200 and an array", async() => {
            const res = await request(app).get("/api/forums");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        test("returns 200 and array when searching", async() => {
            const res = await request(app).get("/api/forums?search=test");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // GET /:id
    describe("GET /api/forums/:id", () => {
        test("returns 200 and a forum object for valid id", async () => {
            // first get all forums to get a real id
            const allForums = await request(app).get("/api/forums");
            const realId = allForums.body[0].id;

            const res = await request(app).get(`/api/forums/${realId}`);
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
                createdBy: "testuser"
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
        test("returns 200 and deletes forum test", async () => {
            // first create a forum to delete
            const created = await request(app).post("/api/forums").send({
                title: "Forum to delete",
                content: "This will be deleted",
                createdBy: "testuser"
            });
            const forumId = created.body.id;

            const res = await request(app).delete(`/api/forums/${forumId}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Forum deleted successfully");
        });
    });

    // PATCH /:id/like/:amount
    describe("PATCH /api/forums/:id/like/:amount", () => {
        test("returns 200 and likes a forum post", async () => {
            const created = await request(app).post("/api/forums").send({
                title: "Forum to like",
                content: "Like this post",
                createdBy: "testuser"
            });
            const forumId = created.body.id;

            const res = await request(app).patch(`/api/forums/${forumId}/like/1`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Forum post liked successfully");
        });
    });

    // GET /:id/comments
    describe("GET /api/forums/:id/comments", () => {
        test("returns 200 and an array of comments", async () => {
            const created = await request(app).post("/api/forums").send({
                title: "Forum for Comments",
                content: "Check thecomments",
                createdBy: "testuser"
            });
            const forumId = created.body.id;

            const res = await request(app).get(`/api/forums/${forumId}/comments`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // POST /:id/comments
    describe("POST /api/forums/:id/comments", () => {
        let forumId;

        beforeAll(async () => {
            const created = await request(app).post("/api/forums").send({
                title: "Forums for Comment Tests",
                content: "Testing comment routes",
                createdBy: "testuser"
            });
            forumId = created.body.id;
        });

        test("returns 201 and creates comment with valid data", async () => {
            const res = await request(app)
                .post(`/api/forums/${forumId}/comments`)
                .send({ authorId: "testuser", comment: "Great post!" });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
        });

        test("returns 400 when missing required fields", async () => {
            const res = await request(app)
                .post(`/api/forums/${forumId}/comments`)
                .send({});
            expect(res.status).toBe(400);
        });
    });

    // PATCH /:id/comments/:commentId/like/:amount
    describe("PATCH /api/forums/:id/comments/:commentId/like/:amount", () => {
        test("returns 200 and likes a comment", async () => {
            const forum = await request(app).post("/api/forums").send({
                title: "Forum for Comment Like",
                content: "Like a comment here",
                createdBy: "testuser"
            });
            const forumId = forum.body.id;

            const comment = await request(app)
                .post(`/api/forums/${forumId}/comments`)
                .send({ authorId: "testuser", comment: "Like me!" });
            const commentId = comment.body.id;

            const res = await request(app).patch(
                `/api/forums/${forumId}/comments/${commentId}/like/1`
            );
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Comment liked successfully");
        });
    });

    // DELETE /:id/comments/:commentId
    describe("DELETE /api/forums/:id/comments/:commentId", () => {
        test("returns 200 and deletes a comment", async () => {
            const forum = await request(app).post("/api/forums").send({
                title: "Forum for Comment Delete",
                content: "Delete a comment here",
                createdBy: "testuser"
            });
            const forumId = forum.body.id;

            const comment = await request(app)
                .post(`/api/forums/${forumId}/comments`)
                .send({ authorId: "testuser", comment: "Delete me!" });
            const commentId = comment.body.id;

            const res = await request(app).delete(
                `/api/forums/${forumId}/comments/${commentId}`
            );
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message", "Comment deleted successfully");
        });
    });
});