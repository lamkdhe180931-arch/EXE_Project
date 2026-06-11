process.env.CLOUDINARY_CLOUD_NAME = 'demo';
process.env.CLOUDINARY_API_KEY = 'key123';
process.env.CLOUDINARY_API_SECRET = 'secret123';

const cloudinary = require('../services/cloudinary');

const realFetch = global.fetch;
afterAll(() => {
  global.fetch = realFetch;
});

describe('cloudinary.uploadImage', () => {
  test('signs the request, posts to the cloud upload endpoint, returns secure_url', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        secure_url: 'https://res.cloudinary.com/demo/image/upload/x.png',
        public_id: 'artdict/x',
      }),
    });

    const result = await cloudinary.uploadImage('data:image/png;base64,AAAA');

    expect(result.url).toBe(
      'https://res.cloudinary.com/demo/image/upload/x.png'
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('https://api.cloudinary.com/v1_1/demo/image/upload');
    expect(options.method).toBe('POST');

    const body = options.body.toString();
    expect(body).toContain('api_key=key123');
    expect(body).toContain('signature='); // signed upload
    expect(body).toContain('timestamp=');
  });

  test('throws when Cloudinary returns an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ error: { message: 'Invalid image file' } }),
    });

    await expect(cloudinary.uploadImage('bad')).rejects.toThrow(
      'Invalid image file'
    );
  });
});
