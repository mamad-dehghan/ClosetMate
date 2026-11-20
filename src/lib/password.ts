import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const HASH_PREFIX = "scrypt";

/**
 * A valid hash for a password nobody uses. Verifying against it keeps the
 * sign-in timing similar when an email is unknown or belongs to a Google-only
 * account, so the response does not reveal which accounts have passwords.
 */
export const DUMMY_PASSWORD_HASH =
  "scrypt$cc633093e7c07cbfe0744e61b1f88466$" +
  "eea23f044cfbee07f2bc2761aae9a028a16921bbe495693e876176d72c725d5e" +
  "047e03656f4b506082d30a97beb5a96e100a4ff4e088be3ae19d8e90e9a86f6b";

function scrypt(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(password, salt);
  return `${HASH_PREFIX}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
) {
  if (!stored) return false;

  const [prefix, saltHex, hashHex] = stored.split("$");
  if (prefix !== HASH_PREFIX || !saltHex || !hashHex) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltHex, "hex");
    expected = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }

  if (salt.length !== SALT_LENGTH || expected.length !== KEY_LENGTH) {
    return false;
  }

  const derived = await scrypt(password, salt);
  return timingSafeEqual(derived, expected);
}
