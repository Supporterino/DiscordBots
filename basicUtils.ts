const compTwoStringsInsensitive = (a: String, b: String) => {
    return stringSanitize(a) === stringSanitize(b);
}

const stringSanitize = (a: String) => {
    return a.trim().toUpperCase().replace(/\s/g, '');
}