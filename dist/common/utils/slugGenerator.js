"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = void 0;
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/[\s_-]+/g, '-') // Replace spaces with -
        .replace(/^-+|-+$/g, '') +
        '-' +
        Date.now().toString().slice(-4); // Add unique suffix
};
exports.generateSlug = generateSlug;
//# sourceMappingURL=slugGenerator.js.map