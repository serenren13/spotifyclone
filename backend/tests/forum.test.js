const request = require("supertest");
const app = require("../app");

describe("Forum Routes", () => {

    test("GET /api/forums returns 200 and an array", async () => {
        const res = await request(app).get("/api/forums");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

});