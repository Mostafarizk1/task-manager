const bcrypt = require('bcryptjs');

async function generatePasswords() {
  const password123 = await bcrypt.hash('password123', 10);
  const password456 = await bcrypt.hash('password456', 10);
  
  console.log('Password hashes generated:');
  console.log('password123:', password123);
  console.log('password456:', password456);
  
  console.log('\n--- SQL to run in Supabase ---\n');
  console.log(`UPDATE "User" SET password = '${password123}' WHERE email IN ('admin@example.com', 'user1@example.com');`);
  console.log(`UPDATE "User" SET password = '${password456}' WHERE email = 'user2@example.com';`);
}

generatePasswords();
