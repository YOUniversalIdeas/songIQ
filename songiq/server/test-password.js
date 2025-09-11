const bcrypt = require('bcrypt');

async function testPassword() {
  const password = 'password123';
  console.log('Original password:', password);
  
  // Hash the password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Hashed password:', hashedPassword);
  
  // Test comparison
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Password comparison result:', isValid);
  
  // Test with different password
  const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
  console.log('Wrong password comparison result:', isInvalid);
}

testPassword().catch(console.error);
