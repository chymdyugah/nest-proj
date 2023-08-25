import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { S3Module } from '../s3/s3.module';
// import { MulterModule } from '@nestjs/platform-express';

@Module({
  // imports: [MulterModule.register({})],
  controllers: [UserController],
  providers: [UserService],
  imports: [S3Module],
})
export class UserModule {}
