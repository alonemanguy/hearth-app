import { supabase } from './supabase';

export type ApplianceFile = {
  name: string;
  path: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

const BUCKET = 'appliance-files';
const MAX_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
  'application/pdf',
];

export function isAllowedFile(file: File): { ok: boolean; error?: string } {
  // Some phones don't report a MIME type — allow if extension looks right
  const lowerName = file.name.toLowerCase();
  const looksLikeImage = /\.(jpe?g|png|webp|heic|heif|gif)$/i.test(lowerName);
  const looksLikePdf = /\.pdf$/i.test(lowerName);

  if (file.size > MAX_SIZE) {
    return {
      ok: false,
      error: `File is too large (${formatFileSize(file.size)}). Max is 10 MB.`,
    };
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: `File type "${file.type}" is not allowed.` };
  }

  if (!file.type && !looksLikeImage && !looksLikePdf) {
    return { ok: false, error: 'Only images and PDFs are allowed.' };
  }

  return { ok: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function isImage(mimeType: string): boolean {
  if (mimeType.startsWith('image/')) return true;
  // Fallback for phones without MIME
  return /\.(jpe?g|png|webp|heic|heif|gif)$/i.test(mimeType);
}

export async function listApplianceFiles(
  applianceId: string
): Promise<ApplianceFile[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(applianceId, {
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    console.error('[uploads] list error:', error);
    return [];
  }

  if (!data) return [];

  return data
    .filter((f) => f.name && !f.name.startsWith('.'))
    .map((f) => {
      const meta = (f.metadata ?? {}) as Record<string, unknown>;
      return {
        name: f.name,
        path: `${applianceId}/${f.name}`,
        size: typeof meta.size === 'number' ? meta.size : 0,
        mimeType: typeof meta.mimetype === 'string' ? meta.mimetype : '',
        createdAt: f.created_at ?? '',
      };
    });
}

export async function uploadApplianceFile(
  applianceId: string,
  file: File
): Promise<{ file: ApplianceFile | null; error: string | null }> {
  console.log('[uploads] starting upload:', {
    applianceId,
    name: file.name,
    type: file.type,
    size: file.size,
  });

  const check = isAllowedFile(file);
  if (!check.ok) {
    console.log('[uploads] rejected:', check.error);
    return { file: null, error: check.error ?? 'File not allowed.' };
  }

  const timestamp = Date.now();
  const safeName = (file.name || 'photo')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80);
  const filename = `${timestamp}-${safeName}`;
  const path = `${applianceId}/${filename}`;

  console.log('[uploads] uploading to path:', path);

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  });

  if (error) {
    console.error('[uploads] upload error:', error);
    return { file: null, error: error.message ?? 'Upload failed.' };
  }

  console.log('[uploads] upload succeeded');

  return {
    file: {
      name: filename,
      path,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      createdAt: new Date().toISOString(),
    },
    error: null,
  };
}

export async function deleteApplianceFile(
  path: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) return { error: error.message };
  return { error: null };
}

export async function getSignedUrl(
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data) return null;
  return data.signedUrl;
}