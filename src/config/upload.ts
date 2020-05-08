import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

const tempPath = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: tempPath,
  storage: multer.diskStorage({
    destination: tempPath,
    filename(req, file, cb) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}.${file.originalname}`;

      return cb(null, fileName);
    },
  }),
};
