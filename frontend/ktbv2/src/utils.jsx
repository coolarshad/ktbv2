import { toWords } from 'number-to-words';

export const capitalizeKey = (key) => {
    if (!key) return '';
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const BASE_URL = import.meta.env.VITE_API_URL !== undefined 
    ? import.meta.env.VITE_API_URL 
    : (typeof window !== 'undefined' 
        ? (window.location.hostname === 'localhost' && window.location.port === '5173' 
            ? 'http://localhost:8000' 
            : window.location.origin) 
        : 'http://localhost:8000');

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

export const format2Dec = (val) => {
    if (val === undefined || val === null || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? String(val) : num.toFixed(2);
};

export const format4Dec = (val) => {
    if (val === undefined || val === null || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? String(val) : num.toFixed(4);
};

export const CURRENCY_SUBUNITS = {
    // North America & Europe
    USD: { singular: 'CENT', plural: 'CENTS' },
    CAD: { singular: 'CENT', plural: 'CENTS' },
    EUR: { singular: 'CENT', plural: 'CENTS' },
    GBP: { singular: 'PENNY', plural: 'PENCE' },
    CHF: { singular: 'RAPPEN', plural: 'RAPPEN' },
    SEK: { singular: 'ORE', plural: 'ORE' },
    NOK: { singular: 'ORE', plural: 'ORE' },
    DKK: { singular: 'ORE', plural: 'ORE' },
    PLN: { singular: 'GROSZ', plural: 'GROSZY' },
    TRY: { singular: 'KURUS', plural: 'KURUS' },
    RUB: { singular: 'KOPEK', plural: 'KOPEKS' },

    // Middle East & GCC
    AED: { singular: 'FIL', plural: 'FILS' },
    SAR: { singular: 'HALALA', plural: 'HALALAS' },
    QAR: { singular: 'DIRHAM', plural: 'DIRHAMS' },
    KWD: { singular: 'FIL', plural: 'FILS' },
    BHD: { singular: 'FIL', plural: 'FILS' },
    OMR: { singular: 'BAISA', plural: 'BAISAS' },
    IQD: { singular: 'FIL', plural: 'FILS' },
    JOD: { singular: 'PIASTRE', plural: 'PIASTRES' },
    EGP: { singular: 'PIASTRE', plural: 'PIASTRES' },

    // South Asia
    INR: { singular: 'PAISA', plural: 'PAISE' },
    NPR: { singular: 'PAISA', plural: 'PAISA' },
    NRS: { singular: 'PAISA', plural: 'PAISA' },
    RS: { singular: 'PAISA', plural: 'PAISA' },
    NEPALIRUPEE: { singular: 'PAISA', plural: 'PAISA' },
    NEPALESERUPEE: { singular: 'PAISA', plural: 'PAISA' },
    PKR: { singular: 'PAISA', plural: 'PAISE' },
    BDT: { singular: 'POISHA', plural: 'POISHA' },
    TAKA: { singular: 'POISHA', plural: 'POISHA' },
    LKR: { singular: 'CENT', plural: 'CENTS' },
    MVR: { singular: 'LAARI', plural: 'LAARI' },
    BTN: { singular: 'CHETTRUM', plural: 'CHETTRUMS' },

    // Southeast & East Asia
    SGD: { singular: 'CENT', plural: 'CENTS' },
    MYR: { singular: 'SEN', plural: 'SEN' },
    THB: { singular: 'SATANG', plural: 'SATANGS' },
    IDR: { singular: 'SEN', plural: 'SEN' },
    PHP: { singular: 'CENTAVO', plural: 'CENTAVOS' },
    VND: { singular: 'XU', plural: 'XU' },
    MMK: { singular: 'PYA', plural: 'PYA' },
    KYAT: { singular: 'PYA', plural: 'PYA' },
    MYANMARKYAT: { singular: 'PYA', plural: 'PYA' },
    BND: { singular: 'SEN', plural: 'SEN' },
    CNY: { singular: 'FEN', plural: 'FEN' },
    RMB: { singular: 'FEN', plural: 'FEN' },
    HKD: { singular: 'CENT', plural: 'CENTS' },
    TWD: { singular: 'CENT', plural: 'CENTS' },
    JPY: { singular: 'SEN', plural: 'SEN' },
    KRW: { singular: 'JEON', plural: 'JEON' },

    // Oceania
    AUD: { singular: 'CENT', plural: 'CENTS' },
    NZD: { singular: 'CENT', plural: 'CENTS' },
    FJD: { singular: 'CENT', plural: 'CENTS' },
    PGK: { singular: 'TOEA', plural: 'TOEA' },

    // Latin America
    BRL: { singular: 'CENTAVO', plural: 'CENTAVOS' },
    MXN: { singular: 'CENTAVO', plural: 'CENTAVOS' },
    CLP: { singular: 'CENTAVO', plural: 'CENTAVOS' },
    COP: { singular: 'CENTAVO', plural: 'CENTAVOS' },
    PEN: { singular: 'CENTIMO', plural: 'CENTIMOS' },
    ARS: { singular: 'CENTAVO', plural: 'CENTAVOS' },

    // Africa
    ZAR: { singular: 'CENT', plural: 'CENTS' },
    NGN: { singular: 'KOBO', plural: 'KOBO' },
    KES: { singular: 'CENT', plural: 'CENTS' },
    GHS: { singular: 'PESEWA', plural: 'PESEWAS' },
    MUR: { singular: 'CENT', plural: 'CENTS' },
    TZS: { singular: 'CENT', plural: 'CENTS' },
    UGX: { singular: 'CENT', plural: 'CENTS' },
};

export const amountToWords = (amount, currency = '') => {
    if (amount === undefined || amount === null || amount === '') return '';
    const num = Number(amount);
    if (isNaN(num)) return '';

    const [intStr, decStr] = num.toFixed(2).split('.');
    const intVal = parseInt(intStr, 10);
    const decVal = parseInt(decStr, 10);

    const currencyName = typeof currency === 'object' && currency !== null ? currency.name : currency;
    const cleanCurrency = (currencyName || '').trim().toUpperCase();
    const normalizedKey = cleanCurrency.replace(/[^A-Z]/g, '');
    const subunit = CURRENCY_SUBUNITS[cleanCurrency] || CURRENCY_SUBUNITS[normalizedKey] || { singular: 'CENT', plural: 'CENTS' };

    const intWords = toWords(intVal).replace(/,/g, '');
    const parts = [];
    if (cleanCurrency) parts.push(cleanCurrency);

    if (intVal > 0 || decVal === 0) {
        parts.push(intWords);
    }

    if (decVal > 0) {
        const decWords = toWords(decVal).replace(/,/g, '');
        const subunitName = decVal === 1 ? subunit.singular : subunit.plural;
        if (intVal > 0) {
            parts.push(`AND ${decWords} ${subunitName}`);
        } else {
            parts.push(`${decWords} ${subunitName}`);
        }
    }

    parts.push('ONLY');
    return parts.join(' ').toUpperCase();
};