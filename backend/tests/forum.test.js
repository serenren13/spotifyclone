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

    // POST /api/forums

});