export const deepMerge = (target: any, source: any): any => {
    // If either target or source is not an object, just return source
    if (typeof target !== "object" || target === null) return source;
    if (typeof source !== "object" || source === null) return target;

    // Recursively merge properties
    const output = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === "object") {
            output[key] = deepMerge(target[key], source[key]); // Deep merge if both are objects
        } else {
            output[key] = source[key]; // Overwrite with source value
        }
    }
    return output;
};
