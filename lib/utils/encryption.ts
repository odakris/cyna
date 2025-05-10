import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const IV_LENGTH = 12; // Norme pour AES-256-GCM
const AUTH_TAG_LENGTH = 16; // Longueur de l'authTag

// Valider et charger ENCRYPTION_KEY
const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY_HEX) {
  throw new Error('ENCRYPTION_KEY is not defined in environment variables');
}
if (ENCRYPTION_KEY_HEX.length !== 64 || !/^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY_HEX)) {
  throw new Error('ENCRYPTION_KEY must be a 64-character hexadecimal string');
}
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');

/**
 * Compresse un code postal en convertissant les chiffres en hexadécimal compact
 * @param postalCode Code postal
 * @returns Chaîne compressée
 */
function compressPostalCode(postalCode: string): string {
  const digits = postalCode.replace(/[^0-9]/g, ''); // Garder seulement les chiffres
  if (!digits) return '0'; // Retourner '0' si vide
  const num = parseInt(digits, 10);
  return num.toString(16).padStart(3, '0'); // Réduire à 3 caractères max
}

/**
 * Décompresse un code postal depuis hexadécimal vers la chaîne originale
 * @param compressed Chaîne compressée
 * @returns Code postal original
 */
function decompressPostalCode(compressed: string): string {
  const num = parseInt(compressed, 16);
  return num.toString().padStart(5, '0');
}

/**
 * Chiffre une chaîne et retourne une chaîne hexadécimale contenant IV, authTag et données chiffrées
 * @param text Chaîne à chiffrer (peut être vide sauf pour postal_code)
 * @param isPostalCode Indique si c'est un code postal à compresser
 * @returns Chaîne hexadécimale (iv:authTag:ciphertext)
 */
export function encrypt(text: string, isPostalCode: boolean = false): string {
  if (isPostalCode && !text) throw new Error('Texte à chiffrer requis pour code postal');
  const input = isPostalCode ? compressPostalCode(text) : text || '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(input, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return iv.toString('hex') + ':' + authTag + ':' + encrypted;
}

/**
 * Déchiffre une chaîne hexadécimale contenant IV, authTag et données chiffrées
 * @param encrypted Chaîne hexadécimale (iv:authTag:ciphertext)
 * @param isPostalCode Indique si c'est un code postal à décompresser
 * @returns Chaîne déchiffrée
 */
export function decrypt(encrypted: string, isPostalCode: boolean = false): string {
  if (!encrypted || typeof encrypted !== 'string') {
    console.warn('Valeur chiffrée invalide:', { encrypted, isPostalCode }); // MODIFIÉ : warn au lieu de error
    return ''; // MODIFIÉ : Retourne chaîne vide au lieu de lancer une erreur
  }

  try {
    const parts = encrypted.split(':');
    if (parts.length !== 3) { // MODIFIÉ : Vérification explicite que split produit 3 parties
      console.warn('Format de données chiffrées invalide, attendu 3 parties:', { encrypted, parts });
      return ''; // MODIFIÉ : Retourne chaîne vide au lieu de lancer une erreur
    }

    const [ivHex, authTagHex, ciphertext] = parts;
    if (!ciphertext) { // MODIFIÉ : Vérification explicite que ciphertext n'est pas vide
      console.warn('Ciphertext vide dans les données chiffrées:', { encrypted });
      return ''; // MODIFIÉ : Retourne chaîne vide au lieu de lancer une erreur
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      console.warn('IV ou authTag de longueur invalide:', { // MODIFIÉ : warn au lieu de error
        ivLength: iv.length,
        expectedIvLength: IV_LENGTH,
        authTagLength: authTag.length,
        expectedAuthTagLength: AUTH_TAG_LENGTH,
        encrypted
      });
      return ''; // MODIFIÉ : Retourne chaîne vide au lieu de lancer une erreur
    }

    const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return isPostalCode ? decompressPostalCode(decrypted) : decrypted;
  } catch (error) {
    console.warn('Erreur de déchiffrement:', { error, encrypted, isPostalCode }); // MODIFIÉ : warn au lieu de error
    return ''; // MODIFIÉ : Retourne chaîne vide au lieu de lancer une erreur
  }
}