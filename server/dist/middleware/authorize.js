"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
const errors_1 = require("../utils/errors");
function authorize(roles) {
    return (req, _res, next) => {
        if (!req.user) {
            next(new errors_1.AuthenticationError('Authentication context missing'));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new errors_1.AuthorizationError(`Role ${req.user.role} cannot access this endpoint`));
            return;
        }
        next();
    };
}
//# sourceMappingURL=authorize.js.map