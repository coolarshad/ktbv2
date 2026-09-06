export const capitalizeKey = (key) => {
    if (!key) return '';
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const BASE_URL = 'http://148.72.247.191:8000'

export const hasPermission = (user, requiredCode) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    if (!requiredCode) return true;
    if (Array.isArray(requiredCode)) {
        return requiredCode.some(p => user.permission_codes && user.permission_codes.includes(p));
    }
    if (user.permission_codes && user.permission_codes.includes(requiredCode)) return true;
    return false;
};

export const canUserDeleteApproved = (user, permCode) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    if (user.role === 'Manager2') {
        if (!permCode) return true;
        const codes = Array.isArray(permCode) ? permCode : [permCode];
        if (codes.some(p => hasPermission(user, p))) return true;
        const userPerms = user.permission_codes || [];
        for (const code of codes) {
            if (userPerms.includes(code)) return true;
            const base = code.replace('delete_', '');
            if (userPerms.some(p => p.startsWith('delete_') && p.includes(base))) return true;
        }
        if (userPerms.some(p => p.startsWith('delete_'))) return true;
        return true;
    }
    return false;
};

export const canUserUpdateApproved = (user, permCode) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    if (user.role === 'Manager2') {
        if (!permCode) return true;
        const codes = Array.isArray(permCode) ? permCode : [permCode];
        if (codes.some(p => hasPermission(user, p))) return true;
        const userPerms = user.permission_codes || [];
        for (const code of codes) {
            if (userPerms.includes(code)) return true;
            const base = code.replace('update_', '').replace('change_', '');
            if (userPerms.some(p => p.startsWith('update_') && p.includes(base))) return true;
        }
        if (userPerms.some(p => p.startsWith('update_'))) return true;
        return true;
    }
    return false;
};

export const canUserDeleteSystemRecord = (user, permCode) => {
    return canUserDeleteApproved(user, permCode);
};