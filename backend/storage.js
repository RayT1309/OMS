const { supabaseAdmin } = require('./auth');

const PHOTO_BUCKET = 'photos';

function parsePhotoDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) throw new Error('photo must be a base64 image data URL');
  return { contentType: match[1], buffer: Buffer.from(match[2], 'base64') };
}

// Uploads a captured photo (base64 data URL) to Supabase Storage under
// `${folder}/${id}-<timestamp>.<ext>` and returns its public URL. Callers
// store only the returned URL in Postgres.
async function uploadPhoto(folder, id, dataUrl) {
  const { contentType, buffer } = parsePhotoDataUrl(dataUrl);
  const ext = contentType.split('/')[1].split('+')[0] || 'jpg';
  const path = `${folder}/${id}-${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(PHOTO_BUCKET)
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

module.exports = { uploadPhoto };
