const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const app = express();

// تنظیم Multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ایجاد فولدر uploads
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Endpoint برای تست
app.get('/', (req, res) => res.send('Hello World!'));

// Endpoint برای آپلود و پردازش
app.post('/upload', upload.array('images', 2), (req, res) => {
  if (!req.files || req.files.length !== 2) {
    return res.status(400).send('Please upload exactly two images');
  }

  const [referenceImage, patientImage] = req.files.map(file => file.path);
  const pythonPath = '/Users/poriyazibaei/opt/anaconda3/envs/smileproject-env/bin/python'; // مسیر واقعی رو از which python بگیر
  const scriptPath = path.join(__dirname, 'process_image.py');

  console.log(`Running Python with paths: Ref=${referenceImage}, Patient=${patientImage}`); // لگاریگ برای عیب‌یابی

  exec(`${pythonPath} ${scriptPath} "${referenceImage}" "${patientImage}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${stderr}`);
      return res.status(500).send(`Processing error: ${stderr}`);
    }
    res.json({ result: stdout }); // ارسال کل stdout به frontend
  });
});

app.listen(5001, () => console.log('Server running on port 5001'));