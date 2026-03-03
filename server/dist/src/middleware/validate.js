"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
function validate(schema, source = 'body') {
    return (req, _res, next) => {
        try {
            const parsed = schema.parse(req[source]);
            req[source] = parsed;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const fieldErrors = error.flatten();
                next(new errors_1.ValidationError('Validation failed', { fieldErrors }));
                return;
            }
            next(error);
        }
    };
}
//# sourceMappingURL=validate.js.map