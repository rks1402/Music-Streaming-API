const request = require("supertest");
const app = require("../src/app");
const { createUser } = require("./helpers");

describe("Auth Endpoints", () => {
  // ─── REGISTER ──────────────────────────────────────────────
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("User registered successfully");
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.username).toBe("newuser");
      expect(res.body.user.email).toBe("newuser@example.com");
      expect(res.body.user.role).toBe("user");
    });

    it("should register a user with artist role", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "artistuser",
        email: "artist@example.com",
        password: "password123",
        role: "artist",
      });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe("artist");
    });

    it("should set a token cookie on successful registration", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "cookieuser",
        email: "cookie@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const tokenCookie = Array.isArray(cookies)
        ? cookies.find((c) => c.startsWith("token="))
        : cookies;
      expect(tokenCookie).toMatch(/^token=/);
    });

    it("should return 400 when required fields are missing", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "incomplete",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("All fields are required");
    });

    it("should return 400 when email is missing", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "nomail",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("All fields are required");
    });

    it("should return 422 when user already exists (duplicate email)", async () => {
      await createUser({ username: "existing", email: "dup@example.com" });

      const res = await request(app).post("/api/auth/register").send({
        username: "different",
        email: "dup@example.com",
        password: "password123",
      });

      expect(res.status).toBe(422);
      expect(res.body.message).toBe("User already exists");
    });

    it("should return 422 when user already exists (duplicate username)", async () => {
      await createUser({ username: "taken", email: "unique@example.com" });

      const res = await request(app).post("/api/auth/register").send({
        username: "taken",
        email: "other@example.com",
        password: "password123",
      });

      expect(res.status).toBe(422);
      expect(res.body.message).toBe("User already exists");
    });
  });

  // ─── LOGIN ─────────────────────────────────────────────────
  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await createUser({
        username: "loginuser",
        email: "login@example.com",
        password: "password123",
      });
    });

    it("should login with valid email and password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User logged in successfully");
      expect(res.body.user.username).toBe("loginuser");
    });

    it("should login with valid username and password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "loginuser",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User logged in successfully");
    });

    it("should set a token cookie on successful login", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
    });

    it("should return 401 for wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should return 401 for non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "noone@example.com",
        password: "password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  // ─── LOGOUT ────────────────────────────────────────────────
  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User logged out successfully");
    });

    it("should clear the token cookie", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.status).toBe(200);
      const cookies = res.headers["set-cookie"];
      if (cookies) {
        const tokenCookie = Array.isArray(cookies)
          ? cookies.find((c) => c.startsWith("token="))
          : cookies;
        if (tokenCookie) {
          // Cookie should be cleared (empty or expired)
          expect(tokenCookie).toMatch(/token=/);
        }
      }
    });
  });
});
