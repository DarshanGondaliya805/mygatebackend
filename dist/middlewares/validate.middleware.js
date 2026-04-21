"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map((v) => v.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
            });
            return;
        }
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map