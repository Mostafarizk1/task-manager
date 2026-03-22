const bcrypt = require('bcryptjs');

async function testPassword() {
  // Generate new hash
  const hash = await bcrypt.hash('password123', 10);
  console.log('New hash for password123:', hash);
  
  // Test comparison
  const isValid = await bcrypt.compare('password123', hash);
  console.log('Password comparison test:', isValid ? 'PASSED ✅' : 'FAILED ❌');
  
  // Test with the hash we used before
  const oldHash = '$2a$10$wbyCSJx5P4YzeyhicvDBm.27O7gkBzMQxv6WivfwAY/2tLhOLusfK';
  const isOldValid = await bcrypt.compare('password123', oldHash);
  console.log('Old hash comparison:', isOldValid ? 'PASSED ✅' : 'FAILED ❌');
}

testPassword();
