async function seedUser() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin',
        email: 'arsathib24@gmail.com',
        password: '123456',
        role: 'admin'
      })
    });
    const data = await res.json();
    console.log('User registered:', data);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}

seedUser();
