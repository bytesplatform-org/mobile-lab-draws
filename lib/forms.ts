/** Validation shared by the forms and their Server Actions. */
export const EMAIL = /^\S+@\S+\.\S+$/;

/** A phone number: at least 7 digits, allowing spaces, dots, dashes, brackets and a leading +. */
export const PHONE = /^\+?[\d\s().-]{7,24}$/;
export const phoneOk = (v: string) => PHONE.test(v) && v.replace(/\D/g, "").length >= 7;
