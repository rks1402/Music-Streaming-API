const { generateToken } = require("./helpers");
const { authUser, authArtist } = require("../src/middlewares/auth.middleware");

/**
 * Create mock Express req/res/next objects for middleware testing.
 */
const createMocks = (cookieToken) => {
  const req = {
    cookies: cookieToken ? { token: cookieToken } : {},
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe("Auth Middleware", () => {
  // ─── authUser ──────────────────────────────────────────────
  describe("authUser", () => {
    it("should return 401 when no token is provided", () => {
      const { req, res, next } = createMocks(null);
      authUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid", () => {
      const { req, res, next } = createMocks("invalid-token");
      authUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when user has artist role", () => {
      const token = generateToken({ id: "user123", role: "artist" });
      const { req, res, next } = createMocks(token);
      authUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Access Forbidden" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next and set req.user for valid user token", () => {
      const token = generateToken({ id: "user123", role: "user" });
      const { req, res, next } = createMocks(token);
      authUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBe("user123");
    });
  });

  // ─── authArtist ────────────────────────────────────────────
  describe("authArtist", () => {
    it("should return 401 when no token is provided", () => {
      const { req, res, next } = createMocks(null);
      authArtist(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid", () => {
      const { req, res, next } = createMocks("bad-token-here");
      authArtist(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when user has user role (not artist)", () => {
      const token = generateToken({ id: "user456", role: "user" });
      const { req, res, next } = createMocks(token);
      authArtist(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Access Forbidden" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next and set req.user for valid artist token", () => {
      const token = generateToken({ id: "artist789", role: "artist" });
      const { req, res, next } = createMocks(token);
      authArtist(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBe("artist789");
    });
  });
});
