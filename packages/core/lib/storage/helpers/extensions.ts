import { MimeTypes } from '../data/mime-db.js';

export const getMimeFromExtension = (fileName: string): string => {
  const fileSplit = fileName.split('.');
  const fileExtension = fileSplit[fileSplit.length - 1];

  for (const mimeType in MimeTypes) {
    const meta = MimeTypes[mimeType];
    if (meta.extensions && meta.extensions.includes(fileExtension)) {
      return meta.extensions[0];
    }
  }

  return '';
};

export const getMimeTypeFromExtention = (fileName: string): string => {
  const fileSplit = fileName.split('.');
  const fileExtension = fileSplit[fileSplit.length - 1];

  for (const mimeType in MimeTypes) {
    const meta = MimeTypes[mimeType];
    if (meta.extensions && meta.extensions.includes(fileExtension)) {
      return mimeType;
    }
  }

  return;
};
