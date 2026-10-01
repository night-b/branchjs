require('dotenv').config();
const express = require('express');
const app = express();

app.get('/health', function(req, res) {
    res.status(200).json({ status: 'OK', message: 'Eventra is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
console.log('Server running on port ' + PORT);
});