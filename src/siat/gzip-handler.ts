import zlib from 'zlib';
import crypto from 'crypto';

export interface GzipResult {
  compressedData: Buffer;
  hashSha256: string; // Hash SHA-256 en hexadecimal (normalmente en mayúsculas)
}

/**
 * Comprime una cadena de texto (como un XML) en formato Gzip
 * y calcula su hash SHA-256.
 *
 * @param content Contenido en texto plano (generalmente el XML de la factura)
 * @returns GzipResult con los datos comprimidos en Buffer y el hash SHA-256 en mayúsculas
 */
export function compressAndHash(content: string): GzipResult {
  const buffer = Buffer.from(content, 'utf-8');
  
  // Comprimir en Gzip
  const compressedData = zlib.gzipSync(buffer);
  
  // Calcular el hash SHA-256 del archivo comprimido
  const hash = crypto.createHash('sha256');
  hash.update(compressedData);
  const hashSha256 = hash.digest('hex').toUpperCase();
  
  return {
    compressedData,
    hashSha256,
  };
}

/**
 * Descomprime datos Gzip a texto plano
 */
export function decompress(compressed: Buffer): string {
  const decompressed = zlib.gunzipSync(compressed);
  return decompressed.toString('utf-8');
}
