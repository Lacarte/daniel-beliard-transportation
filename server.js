const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve Vue build
app.use(express.static(path.join(__dirname, 'vue-app', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'vue-app', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sunshine Trans running on port ${PORT}`);
});
