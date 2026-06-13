// Pure admin-panel logic — no DOM, no fetch. UMD so the browser loads it via
// <script> (attaches window.AdminCore) and Jest can require() it in Node.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.AdminCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Decode a JWT payload (no signature check — the server enforces auth).
  // Returns the payload object, or null if the token is missing/malformed.
  function decodeJwt(token) {
    if (typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      b64 += '==='.slice((b64.length + 3) % 4); // restore base64 padding
      return JSON.parse(atob(b64));
    } catch (e) {
      return null;
    }
  }

  // Valid = decodable AND has a numeric `exp` (seconds) still in the future.
  function isTokenValid(token, nowSec) {
    const now = typeof nowSec === 'number' ? nowSec : Math.floor(Date.now() / 1000);
    const payload = decodeJwt(token);
    if (!payload || typeof payload.exp !== 'number') return false;
    return payload.exp > now;
  }

  // Role claim from the token, or null.
  function getRole(token) {
    const payload = decodeJwt(token);
    return payload && typeof payload.role === 'string' ? payload.role : null;
  }

  // Flatten the admin artist form (3 fixed Q&A blocks) into the API shape
  // POST /api/artists expects: { ..., content: { quote, qa: [{id,q,a}] } }.
  function buildArtistPayload(form) {
    return {
      name: form.name,
      slug: form.slug,
      role: form.role,
      city: form.city,
      since: Number(form.since),
      avatarUrl: form.avatarUrl || null,
      content: {
        quote: form.quote,
        qa: [
          { id: 'cau-1', q: form.q1, a: form.a1 },
          { id: 'cau-2', q: form.q2, a: form.a2 },
          { id: 'cau-3', q: form.q3, a: form.a3 },
        ],
      },
    };
  }

  // Allowed order-status transitions for the admin dropdown.
  const STATUS_FLOW = {
    PENDING: ['PAID', 'CANCELLED'],
    PAID: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };
  function nextStatuses(current) {
    return STATUS_FLOW[current] || [];
  }

  return { decodeJwt, isTokenValid, getRole, buildArtistPayload, nextStatuses };
});
