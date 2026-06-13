process.env.RESEND_API_KEY = 'rk_test_123';
process.env.EMAIL_FROM = 'Artdict <no-reply@artdict.vn>';

// In test, never hit the network: mock the resend SDK and assert the call.
jest.mock('resend');
const { Resend } = require('resend');

const email = require('../services/email');

// One shared `emails.send` spy; jest resetMocks clears it between tests, so the
// implementation is re-applied in beforeEach.
const send = jest.fn();
beforeEach(() => {
  send.mockResolvedValue({ data: { id: 'em_default' }, error: null });
  Resend.mockImplementation(() => ({ emails: { send } }));
});

describe('email.send', () => {
  test('sends via the Resend SDK with the API key and returns the message id', async () => {
    send.mockResolvedValue({ data: { id: 'em_123' }, error: null });

    const result = await email.send({
      to: 'a@b.com',
      subject: 'Hi',
      html: '<p>x</p>',
    });

    expect(result.id).toBe('em_123');
    expect(Resend).toHaveBeenCalledWith('rk_test_123');
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe('a@b.com');
    expect(arg.subject).toBe('Hi');
    expect(arg.from).toContain('Artdict');
  });

  test('throws when Resend returns an error', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'Invalid to field' } });

    await expect(
      email.send({ to: 'x', subject: 's', html: 'h' })
    ).rejects.toThrow('Invalid to field');
  });
});

describe('email.sendOrderConfirmation', () => {
  test('sends to the guest email and references the order id', async () => {
    send.mockResolvedValue({ data: { id: 'em_9' }, error: null });

    const result = await email.sendOrderConfirmation({
      id: 5,
      total: 250000,
      guestEmail: 'g@e.com',
    });

    expect(result.id).toBe('em_9');
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe('g@e.com');
    expect(arg.subject).toContain('#5');
  });

  test('falls back to the registered user email', async () => {
    await email.sendOrderConfirmation({
      id: 6,
      total: 100,
      user: { email: 'u@e.com' },
    });

    expect(send.mock.calls[0][0].to).toBe('u@e.com');
  });

  test('sends nothing and returns null when there is no recipient', async () => {
    const result = await email.sendOrderConfirmation({
      id: 7,
      total: 100,
      guestEmail: null,
      user: null,
    });

    expect(result).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });
});

describe('email.sendOrderShipped', () => {
  test('notifies the recipient that order #id has shipped', async () => {
    send.mockResolvedValue({ data: { id: 'em_s' }, error: null });

    const result = await email.sendOrderShipped({
      id: 8,
      guestEmail: 'g@e.com',
    });

    expect(result.id).toBe('em_s');
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe('g@e.com');
    expect(arg.subject).toContain('#8');
    expect(arg.subject.toLowerCase()).toMatch(/giao|ship/);
  });

  test('sends nothing and returns null when there is no recipient', async () => {
    const result = await email.sendOrderShipped({ id: 9, user: null });

    expect(result).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });
});

describe('email.sendArtistApplication', () => {
  test('emails the admin with the applicant details and reply-to', async () => {
    send.mockResolvedValue({ data: { id: 'em_a' }, error: null });

    const result = await email.sendArtistApplication('admin@artdict.vn', {
      name: 'Mai',
      email: 'mai@e.com',
      city: 'Sài Gòn',
      portfolio: 'behance.net/mai',
      message: 'Mình muốn hợp tác.',
    });

    expect(result.id).toBe('em_a');
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe('admin@artdict.vn');
    expect(arg.replyTo).toBe('mai@e.com');
    expect(arg.subject).toContain('Mai');
    expect(arg.html).toContain('behance.net/mai');
    expect(arg.html).toContain('Mình muốn hợp tác.');
  });
});
