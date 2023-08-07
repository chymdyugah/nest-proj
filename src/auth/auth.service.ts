import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';

import { AuthDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    try {
      // create password hash
      const hash = await argon.hash(dto.password);

      // create user object
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      // delete the password from the object
      delete user.hash;

      return this.signToken(user.id, user.email);
    } catch (err) {
      // if error is a prisma db error
      if (err instanceof PrismaClientKnownRequestError) {
        // 2002 is for unique validation
        if (err.code === 'P2002') {
          throw new ForbiddenException('Sorry, you can not use that email');
        }
      }

      // if error is not a prisma db error
      throw err;
    }
  }

  async login(dto: AuthDto) {
    // get the user
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user is not found
    if (!user) throw new ForbiddenException('Email or Password is incorrect');

    // verify that password matches
    const psswordMatch = await argon.verify(user.hash, dto.password);

    // if password does not match
    if (!psswordMatch)
      throw new ForbiddenException('Email or Password is incorrect');

    delete user.hash;

    // return user
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string) {
    const data = {
      mail: email,
      uid: userId,
    };

    const access_token = await this.jwt.signAsync(data, {
      expiresIn: '30m',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token,
    };
  }
}
