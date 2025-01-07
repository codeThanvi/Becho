import multer, { Multer, StorageEngine } from "multer";
import { Request } from "express";

const storage: StorageEngine = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: (Error | null), destination: string) => void) {
      cb(null, '/tmp/my-uploads');
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: (Error | null), filename: string) => void) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix);
    }
  });
  
const upload: Multer = multer({ storage: storage });

export default upload;
