export const capitalizeKey = (key) => {
    if (!key) return '';
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const BASE_URL = 'http://localhost:8000'

export const hasPermission = (user, requiredCode) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    if (user.permission_codes && user.permission_codes.includes(requiredCode)) return true;
    return false;
};