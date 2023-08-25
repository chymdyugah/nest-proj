import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid4 } from 'uuid';

import path = require('path'); // import node inbuilt modules like this

export class LocalFileInterceptor extends FileInterceptor(
  'file', // this is the name of the file field
  {
    // rename the file
    storage: diskStorage({
      destination: './uploads/profile',
      filename: (req, file, cb) => {
        console.log(file.originalname);
        const name = uuid4().toString();
        const ext = path.extname(
          file.originalname,
        );
        cb(null, `${name}${ext}`);
      },
    }),
  },
) {
  constructor() {
    super();
  }
}

export class MyFileInterceptor extends FileInterceptor(
  'file',
) {
  constructor() {
    super();
  }
}
