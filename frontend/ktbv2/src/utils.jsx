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

export const canUserDeleteApproved = (user, permCode) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    if (user.role === 'Manager2') {
        if (!permCode) return true;
        if (Array.isArray(permCode)) {
            return permCode.some(p => hasPermission(user, p));
        }
        return hasPermission(user, permCode);
    }
    return false;
};

export const canUserUpdateApproved = (user, permCode) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    if (user.role === 'Manager2') {
        if (!permCode) return true;
        if (Array.isArray(permCode)) {
            return permCode.some(p => hasPermission(user, p));
        }
        return hasPermission(user, permCode);
    }
    return false;
};

export const canUserDeleteSystemRecord = (user, permCode) => {
    return canUserDeleteApproved(user, permCode);
};