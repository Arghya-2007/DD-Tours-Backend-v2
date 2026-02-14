"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            // Validate everything: body, query, params, and cookies
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
                cookies: req.cookies,
            });
            // If successful, go to the next middleware/controller
            return next();
        }
        catch (error) {
            // If validation fails, return 400 Bad Request immediately
            return res.status(400).json(error);
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map