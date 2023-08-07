import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // so the module can be used by the entire app
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
