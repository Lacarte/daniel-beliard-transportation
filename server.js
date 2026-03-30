const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve Vue build
const vueDist = path.join(__dirname, 'vue-app', 'dist');
app.use(express.static(vueDist));

app.get('*', (req, res) => {
  res.sendFile(path.join(vueDist, 'index.html'));
});

const os = require('os');
const nets = os.networkInterfaces();
let lanIP = 'localhost';
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('172.')) {
      lanIP = net.address;
    }
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log('Sunshine Trans running on:');
  console.log(`  Local: http://localhost:${PORT}`);
  console.log(`  LAN:   http://${lanIP}:${PORT}`);
});
