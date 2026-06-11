// Cloudinary upload service (signed REST upload).
// Docs: https://cloudinary.com/documentation/image_upload_api_reference
// Like the MoMo service, env is read lazily and the HTTP call uses the built-in
// global `fetch` (Node >= 18) + `crypto` — no SDK dependency. `file` may be a
// remote URL or a base64 data URI (both accepted by Cloudinary's `file` param).
const crypto = require('crypto');

function config() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'artdict',
  };
}

// Cloudinary signature: sha1 of the alphabetically-sorted params to sign
// (excluding file/api_key/resource_type) with the api_secret appended.
function sign(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

async function uploadImage(file) {
  const c = config();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ folder: c.folder, timestamp }, c.apiSecret);

  const form = new URLSearchParams({
    file,
    api_key: c.apiKey,
    folder: c.folder,
    timestamp: String(timestamp),
    signature,
  });

  const resp = await fetch(
    `https://api.cloudinary.com/v1_1/${c.cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  const data = await resp.json();

  if (data.error) {
    throw new Error(data.error.message || 'Upload Cloudinary thất bại');
  }
  return { url: data.secure_url, publicId: data.public_id };
}

module.exports = { uploadImage };
