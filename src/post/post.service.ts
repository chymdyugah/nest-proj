import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePostDto,
  EditPostDto,
} from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async listPosts(userId: number, page = 1) {
    const take = parseInt(
      this.config.get('PAGE_SIZE'),
    );
    const skip = take * (page - 1);
    return await this.prisma.post.findMany({
      where: {
        userId,
      },
      take,
      skip,
    });
  }

  async getPost(userId: number, postId: number) {
    return await this.prisma.post.findFirst({
      where: {
        userId,
        id: postId,
      },
    });
  }

  async editPost(
    userId: number,
    postId: number,
    dto: EditPostDto,
  ) {
    return await this.prisma.post.update({
      where: {
        userId,
        id: postId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deletePost(
    userId: number,
    postId: number,
  ) {
    const post =
      await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

    if (!post || post.userId !== userId)
      throw new ForbiddenException(
        'Post does not exist for this user',
      );

    await this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
  }

  async createPost(
    userId: number,
    dto: CreatePostDto,
  ) {
    return await this.prisma.post.create({
      data: {
        userId,
        ...dto,
      },
    });
  }
}
