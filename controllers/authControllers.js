const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../logics/userLogics');

// User registration
// Process Req: JSON Body
const registerUser = async (req, res) => {
  try {
    // Extract user data from request body
    const { email, password } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
      return res.status(400).json({ message: 'Weak password' });
    }

    // Check if the user already exists
    const existingUser = await User.findByEmail({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = {
      email: email,
      password: hashedPassword,
      role: 'basic'
    };
    
    // Register new user (Depracted 31 May 2023, will be replace with credential and passwordless)
    const registeredId = await User.create(newUser);
    console.log(registeredId);
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User login
// Process Req: JSON Body
const loginUser = async (req, res) => {
  try {
    // Extract user data from request body
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findByEmail({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    res.status(200).json({ token });

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};