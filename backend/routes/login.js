// server/routes/auth.js
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    // ... your existing user validation code ...
    
    // If login successful, create token
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    
    res.send({ 
      user: { id: user.id, username: user.username },
      token 
    });
  } catch (error) {
    res.status(400).send(error);
  }
});