export const generateSlug = (title: string): string => {
    return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/[\s_-]+/g, '-') // Replace spaces with -
            .replace(/^-+|-+$/g, '') +
        '-' +
        Date.now().toString().slice(-4); // Add unique suffix
};