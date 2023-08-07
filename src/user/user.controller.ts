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

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User, @GetUser('email') email: string) {
    console.log(email);
    // return user;
    return this.userService.getUser(user.id);
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }

  @Post('upload')
  @UseInterceptors(MyFileInterceptor)
  uploadImage(@GetUser('id') userId: number, @UploadedFile() file) {
    // call service
    const dto: EditUserDto = {
      image: file.path,
    };
    return this.userService.uploadImage(userId, dto);
  }
}
