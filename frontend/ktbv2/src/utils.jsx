export const capitalizeKey = (key) => {
    if (!key) return '';
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const BASE_URL = 'http://148.72.247.191:8000'