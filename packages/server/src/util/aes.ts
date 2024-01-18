import crypto from 'crypto';

const algo = 'aes-128-cbc';
const iv = Buffer.alloc(16).fill(0);

export const aesEncrypt = (plainText: string, key: Buffer) => {
  const cipher = crypto.createCipheriv(algo, key, iv);
  cipher.setAutoPadding(true);
  return cipher.update(plainText, 'utf-8', 'binary') + cipher.final('binary');
};

export const aesDecrypt = (cipherText: string, key: Buffer) => {
  const decipher = crypto.createDecipheriv(algo, key, iv);
  decipher.setAutoPadding(true);
  return (
    decipher.update(cipherText, 'binary', 'utf-8') + decipher.final('utf-8')
  );
};
