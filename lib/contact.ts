/**
 * The phone number, written once.
 *
 * Two forms on purpose: the readable one for the page, and the dial string
 * for tel: links — a number with spaces in an href fails on some Android
 * dialers.
 */

export const PHONE_DISPLAY = "+48 780 483 379";
export const PHONE_HREF = "tel:+48780483379";
/** E.164, for schema.org and anything else that wants the canonical form. */
export const PHONE_E164 = "+48780483379";
