import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
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
        } catch (error) {
            // If validation fails, return 400 Bad Request immediately
            return res.status(400).json(error);
        }
    };
};