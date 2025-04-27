import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../client/public');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;

    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  cb(null, isValid);
};

export const upload = multer({ storage, fileFilter });
