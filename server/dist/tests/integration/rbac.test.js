"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supertest_1 = __importDefault(require("supertest"));
const env_1 = require("../../src/config/env");
const authenticate_1 = require("../../src/middleware/authenticate");
const authorize_1 = require("../../src/middleware/authorize");
const errorHandler_1 = require("../../src/middleware/errorHandler");
const types_1 = require("../../src/types");
function buildTestApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get('/admin-only', authenticate_1.authenticate, (0, authorize_1.authorize)([types_1.UserRole.ADMIN]), (_req, res) => {
        res.status(200).json({ ok: true });
    });
    app.use(errorHandler_1.errorHandler);
    return app;
}
describe('RBAC middleware', () => {
    const app = buildTestApp();
    const signToken = (role) => jsonwebtoken_1.default.sign({
        userId: 'u1',
        email: 'user@example.com',
        role,
    }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: '10m' });
    it('allows authorized role', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/admin-only')
            .set('Authorization', `Bearer ${signToken(types_1.UserRole.ADMIN)}`);
        expect(response.status).toBe(200);
    });
    it('blocks unauthorized role', async () => {
        const response = await (0, supertest_1.default)(app)
            .get('/admin-only')
            .set('Authorization', `Bearer ${signToken(types_1.UserRole.VIEWER)}`);
        expect(response.status).toBe(403);
    });
});
//# sourceMappingURL=rbac.test.js.map