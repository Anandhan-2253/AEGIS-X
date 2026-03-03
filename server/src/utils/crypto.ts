import crypto from 'crypto';
import fs from 'fs';

export function hashString(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function generateSecureToken(bytes = 48): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function computeFileMD5(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

export function computeFileSHA256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

export function calculateEntropy(buffer: Buffer): number {
  const counts = new Map<number, number>();
  for (let i = 0; i < buffer.length; i += 1) {
    const value = buffer[i];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let entropy = 0;
  for (const count of counts.values()) {
    const probability = count / buffer.length;
    entropy -= probability * Math.log2(probability);
  }

  return Math.round(entropy * 10000) / 10000;
}

export function extractStrings(buffer: Buffer, minLength = 4): string[] {
  const output: string[] = [];
  let current = '';

  for (let i = 0; i < buffer.length; i += 1) {
    const byte = buffer[i];
    if (byte >= 32 && byte <= 126) {
      current += String.fromCharCode(byte);
      continue;
    }

    if (current.length >= minLength) {
      output.push(current);
    }
    current = '';
  }

  if (current.length >= minLength) {
    output.push(current);
  }

  return output;
}
