import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

export class ImageFilePipe extends ParseFilePipe {
  constructor() {
    super({
      validators: [
        // ... Set of file validator instances here
        new MaxFileSizeValidator({ maxSize: 10000 }),
        new FileTypeValidator({ fileType: /.(jpg|jpeg|png)$/ }),
      ],
    });
  }
}
