const core = require('../js/core');

// Build a structurally-valid JWT (the client never verifies the signature —
// the server does; the panel only reads the payload for exp/role).
function makeJwt(payload) {
  const seg = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${seg({ alg: 'HS256', typ: 'JWT' })}.${seg(payload)}.signature`;
}

describe('decodeJwt', () => {
  test('decodes the payload of a JWT', () => {
    const token = makeJwt({ userId: 1, role: 'ADMIN', exp: 9999999999 });
    expect(core.decodeJwt(token)).toMatchObject({ userId: 1, role: 'ADMIN' });
  });

  test('returns null for a malformed token', () => {
    expect(core.decodeJwt('not-a-jwt')).toBeNull();
    expect(core.decodeJwt('')).toBeNull();
    expect(core.decodeJwt(null)).toBeNull();
  });
});

describe('isTokenValid', () => {
  test('true when exp is in the future', () => {
    expect(core.isTokenValid(makeJwt({ exp: 2000 }), 1000)).toBe(true);
  });

  test('false when the token is expired', () => {
    expect(core.isTokenValid(makeJwt({ exp: 500 }), 1000)).toBe(false);
  });

  test('false for a missing or malformed token', () => {
    expect(core.isTokenValid(null, 1000)).toBe(false);
    expect(core.isTokenValid('x.y.z', 1000)).toBe(false);
  });
});

describe('getRole', () => {
  test('reads the role claim', () => {
    expect(core.getRole(makeJwt({ role: 'ADMIN' }))).toBe('ADMIN');
  });

  test('null when absent or malformed', () => {
    expect(core.getRole(makeJwt({ userId: 1 }))).toBeNull();
    expect(core.getRole('bad')).toBeNull();
  });
});

describe('buildArtistPayload', () => {
  const form = {
    name: 'Nguyễn Mực Tàu',
    slug: 'nguyen-muc-tau',
    role: 'Họa sĩ minh họa',
    city: 'TP.HCM',
    since: '2019',
    avatarUrl: '/assets/art-1.png',
    quote: 'Tôi vẽ để người ta mặc nó ra phố.',
    q1: 'Câu chuyện?',
    a1: 'Mình lớn lên...',
    q2: 'Ngôn ngữ tạo hình?',
    a2: 'Mực đen và đỏ son...',
    q3: 'Nghệ thuật sống ở đâu?',
    a3: 'Trên ba lô, ở quán cà phê...',
  };

  test('formats the three fixed Q&A blocks into content.qa', () => {
    const payload = core.buildArtistPayload(form);
    expect(payload.content.quote).toBe(form.quote);
    expect(payload.content.qa).toHaveLength(3);
    expect(payload.content.qa[0]).toEqual({ id: 'cau-1', q: 'Câu chuyện?', a: 'Mình lớn lên...' });
    expect(payload.content.qa[2].q).toBe('Nghệ thuật sống ở đâu?');
  });

  test('coerces `since` to a number and passes through identity fields', () => {
    const payload = core.buildArtistPayload(form);
    expect(payload.since).toBe(2019);
    expect(payload.name).toBe('Nguyễn Mực Tàu');
    expect(payload.slug).toBe('nguyen-muc-tau');
  });

  test('avatarUrl defaults to null when blank', () => {
    const payload = core.buildArtistPayload({ ...form, avatarUrl: '' });
    expect(payload.avatarUrl).toBeNull();
  });
});

describe('nextStatuses', () => {
  test('PENDING can move to PAID or CANCELLED', () => {
    expect(core.nextStatuses('PENDING')).toEqual(['PAID', 'CANCELLED']);
  });

  test('PAID can move to SHIPPED or CANCELLED', () => {
    expect(core.nextStatuses('PAID')).toEqual(['SHIPPED', 'CANCELLED']);
  });

  test('SHIPPED can only move to DELIVERED', () => {
    expect(core.nextStatuses('SHIPPED')).toEqual(['DELIVERED']);
  });

  test('terminal/unknown statuses have no transitions', () => {
    expect(core.nextStatuses('DELIVERED')).toEqual([]);
    expect(core.nextStatuses('CANCELLED')).toEqual([]);
    expect(core.nextStatuses('???')).toEqual([]);
  });
});

describe('pagination', () => {
  const items = Array.from({ length: 23 }, (_, i) => i + 1); // 1..23

  test('pageCount: 23 items at 10/page = 3 pages', () => {
    expect(core.pageCount(23, 10)).toBe(3);
    expect(core.pageCount(20, 10)).toBe(2);
    expect(core.pageCount(0, 10)).toBe(1); // never zero pages
  });

  test('clampPage: keeps page within [1, last]', () => {
    expect(core.clampPage(0, 23, 10)).toBe(1);
    expect(core.clampPage(99, 23, 10)).toBe(3);
    expect(core.clampPage(2, 23, 10)).toBe(2);
    expect(core.clampPage(NaN, 23, 10)).toBe(1);
  });

  test('pageSlice: returns the right 10-row window', () => {
    expect(core.pageSlice(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(core.pageSlice(items, 2, 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(core.pageSlice(items, 3, 10)).toEqual([21, 22, 23]); // short last page
  });

  test('pageSlice: out-of-range page clamps to the last page', () => {
    expect(core.pageSlice(items, 99, 10)).toEqual([21, 22, 23]);
  });

  test('pageSlice: tolerates a non-array', () => {
    expect(core.pageSlice(null, 1, 10)).toEqual([]);
  });
});
