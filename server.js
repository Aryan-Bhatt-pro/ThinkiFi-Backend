// server.js
const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Define your API endpoints and functions
app.get('/api/get_', (req, res) => {
  
});

app.post('/api/greet', (req, res) => {
  const { name } = req.body;
  res.json({ message: `Hello, ${name}!` });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
