import bcrypt from 'bcryptjs';

// Script to generate password hash for the admin password
const password = process.argv[2];

if (!password) {
  console.error('Usage: tsx server/generate-password-hash.ts <password>');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('Password hash:', hash);
  console.log('\nAdd this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
}).catch(err => {
  console.error('Error generating hash:', err);
  process.exit(1);
});