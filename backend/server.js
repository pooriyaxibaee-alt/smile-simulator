
const express = require('express');
const app = express();
const { exec } = require('child_process');

// Route اصلی
app.get('/', (req, res) => res.send('Hello World!'));

// Route تست Python
app.get('/test-python', (req, res) => {
  exec(
    '/bin/bash -c "source /Users/poriyazibaei/opt/anaconda3/bin/activate smileproject-env && python process_image.py"',
    { env: { ...process.env } },
    (err, stdout, stderr) => {
      if (err) return res.send(`Error: ${stderr || err.message}`);
      res.send(stdout.replace(/\n/g, '<br>'));
    }
  );
});

// شروع سرور
app.listen(5001, () => console.log('Server running on port 5001'));