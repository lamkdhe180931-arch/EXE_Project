process.env.RESEND_API_KEY = 'rk_test_123';
process.env.EMAIL_FROM = 'Artdict <no-reply@artdict.vn>';

const email = require('../services/email');

const realFetch = global.fetch;
afterAll(() => {
  global.fetch = realFetch;
});

describe('email.send', () => {
  test('posts to Resend with bearer auth and returns the message id', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ id: 'em_123' }),
    });

    const result = await email.send({
      to: 'a@b.com',
      subject: 'Hi',
      html: '<p>x</p>',
    });

    expect(result.id).toBe('em_123');
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(options.headers.Authorization).toBe('Bearer rk_test_123');
    const body = JSON.parse(options.body);
    expect(body.to).toBe('a@b.com');
    expect(body.from).toContain('Artdict');
  });

  test('throws when Resend returns an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ name: 'validation_error', message: 'Invalid to field' }),
    });

    await expect(
      email.send({ to: 'x', subject: 's', html: 'h' })
    ).rejects.toThrow('Invalid to field');
  });
});

describe('email.sendOrderConfirmation', () => {
  test('sends to the guest email and references the order id', async () => {
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ id: 'em_9' }) });

    const result = await email.sendOrderConfirmation({
      id: 5,
      total: 250000,
      guestEmail: 'g@e.com',
    });

    expect(result.id).toBe('em_9');
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to).toBe('g@e.com');
    expect(body.subject).toContain('#5');
  });

  test('falls back to the registered user email', async () => {
    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ id: 'em_10' }) });

    await email.sendOrderConfirmation({
      id: 6,
      total: 100,
      user: { email: 'u@e.com' },
    });

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.to).toBe('u@e.com');
  });

  test('sends nothing and returns null when there is no recipient', async () => {
    global.fetch = jest.fn();

    const result = await email.sendOrderConfirmation({
      id: 7,
      total: 100,
      guestEmail: null,
      user: null,
    });

    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
