// tests/unit/hashPassword.test.js
const { hashPassword, comparePassword } = require('../../src/utils/hashPassword');

describe('Password Hashing', () => {

  test('should hash a password', async () => {
    const plain = 'TestPassword@123';
    const hashed = await hashPassword(plain);

    // Hash aur plain alag hone chahiye
    expect(hashed).not.toBe(plain);
    // Bcrypt hash $ se start hota hai
    expect(hashed).toMatch(/^\$2b\$/);
  });

  test('same password should produce different hashes (salt)', async () => {
    const plain = 'TestPassword@123';
    const hash1 = await hashPassword(plain);
    const hash2 = await hashPassword(plain);

    // Salt ki wajah se dono alag hone chahiye
    expect(hash1).not.toBe(hash2);
  });

  test('should return true for correct password', async () => {
    const plain = 'TestPassword@123';
    const hashed = await hashPassword(plain);

    const result = await comparePassword(plain, hashed);
    expect(result).toBe(true);
  });

  test('should return false for wrong password', async () => {
    const hashed = await hashPassword('CorrectPassword@123');
    const result = await comparePassword('WrongPassword@456', hashed);
    expect(result).toBe(false);
  });
});
