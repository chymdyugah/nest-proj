import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guards';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { MyFileInterceptor } from './interceptor';
import { ImageFilePipe } from './pipe';
import { S3Service } from '../s3/s3.service';
import { v4 as uuid4 } from 'uuid';

import path = require('path');

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private s3Service: S3Service,
  ) {}

  @Get('me')
  getMe(
    @GetUser() user: User,
    @GetUser('email') email: string,
  ) {
    console.log(email);
    // return user;
    return this.userService.getUser(user.id);
  }

  @Patch()
  editUser(
    @GetUser('id') userId: number,
    @Body() dto: EditUserDto,
  ) {
    return this.userService.editUser(userId, dto);
  }

  @Post('upload')
  @UseInterceptors(MyFileInterceptor)
  async uploadImage(
    @GetUser('id') userId: number,
    @UploadedFile(new ImageFilePipe())
    file: Express.Multer.File,
  ) {
    const name = uuid4().toString();
    const ext = path.extname(file.originalname);
    const key = `${name}${ext}`;
    // call s3 service
    const url = await this.s3Service.uploadToS3(
      file,
      key,
    );
    // call service
    const dto: EditUserDto = {
      image: url,
    };
    return this.userService.uploadImage(
      userId,
      dto,
    );
  }
}
