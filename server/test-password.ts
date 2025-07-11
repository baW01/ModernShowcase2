import bcrypt from 'bcryptjs';

const password = "Kopia15341534!";
const hash = "$2b$10$Mn.pzelumhNZ9YHk7ExuWeuxq89xghA6SNFVzgId2mAXpviDbiUEO";

console.log('Testing password verification...');
console.log('Password:', password);
console.log('Hash:', hash);

bcrypt.compare(password, hash).then(result => {
  console.log('Verification result:', result);
  
  // Also generate a new hash to double-check
  bcrypt.hash(password, 10).then(newHash => {
    console.log('\nNew hash generated:', newHash);
    
    // Test with the new hash
    bcrypt.compare(password, newHash).then(newResult => {
      console.log('Verification with new hash:', newResult);
    });
  });
}).catch(err => {
  console.error('Error:', err);
});