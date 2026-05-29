const request = require("supertest");
const app = require("../app");

jest.mock('../db/ConversationsService.js', () => ({
    fetchUserInbox: jest.fn().mockResolvedValue([
        { id: 'conv1', participants: ['user1', 'user2'], lastMessage: 'hey!' }
    ]),
    getOrCreateConversation: jest.fn().mockResolvedValue({
        id: 'conv1',
        participants: ['user1', 'user2'],
    }),
    sendMessage: jest.fn().mockResolvedValue({
        id: 'msg1',
        senderId: 'user1',
        text: 'hello',
        conversationId: 'conv1',
        participants: ['user1', 'user2'],
        createdAt: new Date().toISOString(),
    }),
    fetchMessagesForConversation: jest.fn().mockResolvedValue([
        { id: 'msg1', senderId: 'user1', text: 'hello' }
    ]),
    markConversationRead: jest.fn().mockResolvedValue(),
}));

// mock socket.io on app
beforeAll(() => {
    app.set('io', {
        to: jest.fn().mockReturnValue({
            emit: jest.fn(),
        }),
    });
});

describe("Conversations Routes", () => {

    // GET /api/conversations/inbox/:userId
    describe("GET /api/conversations/inbox/:userId", () => {
        test("returns 200 and array of conversations", async () => {
            const res = await request(app).get("/api/conversations/inbox/user1");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    // POST /api/conversations/initialize
    describe("POST /api/conversations/initialize", () => {
        test("returns 200 and conversation object with valid users", async () => {
            const res = await request(app).post("/api/conversations/initialize").send({
                user1: "user1",
                user2: "user2",
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("id");
        });

        test("returns 400 when participants are missing", async () => {
            const res = await request(app).post("/api/conversations/initialize").send({
                user1: "user1",
            });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message", "Both participants are required.");
        });
    });

    // POST /api/conversations/:conversationId/messages
    describe("POST /api/conversations/:conversationId/messages", () => {
        test("returns 201 and sends message with valid data", async () => {
            const res = await request(app)
                .post("/api/conversations/conv1/messages")
                .send({ senderId: "user1", text: "hello" });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
        });

        test("returns 400 when senderId or text is missing", async () => {
            const res = await request(app)
                .post("/api/conversations/conv1/messages")
                .send({ senderId: "user1" });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message", "Sender and text content are required.");
        });
    });

    // POST /api/conversations/:conversationId/read
    describe("POST /api/conversations/:conversationId/read", () => {
        test("returns 200 when marking conversation as read", async () => {
            const res = await request(app)
                .post("/api/conversations/conv1/read")
                .send({ userId: "user1" });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
        });

        test("returns 400 when userId is missing", async () => {
            const res = await request(app)
                .post("/api/conversations/conv1/read")
                .send({});
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message", "userId is required.");
        });
    });

    // GET /api/conversations/:conversationId/messages
    describe("GET /api/conversations/:conversationId/messages", () => {
        test("returns 200 and array of messages", async () => {
            const res = await request(app).get("/api/conversations/conv1/messages");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });
});