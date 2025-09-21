const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const path = require('path');
const cors = require('cors'); // 👈 اضافه کردن این خط

const app = express();
const PORT = 5001;

// 👈 اضافه کردن این خط برای فعال کردن CORS
app.use(cors());

// ذخیره فایل‌ها در پوشه uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/upload', upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }

  const filePaths = req.files.map(file => path.join(__dirname, file.path));

  execFile(
    '/Users/poriyazibaei/opt/anaconda3/envs/smileproject-env/bin/python3',
    [path.join(__dirname, 'process_image.py'), ...filePaths],
    (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing Python script:', error);
        // 🔹 ارجاع پیام خطای پایتون به فرانت‌اند برای دیباگ بهتر
        return res.status(500).json({ error: 'Error processing images', details: stderr || error.message });
      }
      if (stderr) console.error('Python stderr:', stderr);

      res.json({ result: stdout });
    }
  );
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));