import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreatePostDto, EditPostDto } from '../src/post/dto';

describe('App (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // this would run before the test starts
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(4000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:4000');
  });

  // this would run after the test completes
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const body: AuthDto = {
      email: 'chymdy@gmail.com',
      password: 'chymdy',
    };
    describe('Signup', () => {
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(body)
          .expectStatus(201);
      });
      it('should throw error for missing email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: body.password,
          })
          .expectStatus(400);
      });
      it('should throw error for missing password', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: body.email,
          })
          .expectStatus(400);
      });
    });

    describe('Login', () => {
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(body)
          .expectStatus(200)
          .stores('uAt', 'access_token');
      });
      it('should not signin', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: body.email,
            password: '123',
          })
          .expectStatus(403);
      });
    });
  });

  describe('User', () => {
    describe('Get Me', () => {
      it('should return me', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withBearerToken('$S{uAt}')
          .expectStatus(200);
      });
    });

    describe('Edit Me', () => {
      it('should update a user', () => {
        const body: EditUserDto = {
          lastName: 'Ugah',
        };
        return pactum
          .spec()
          .patch('/user')
          .withBearerToken('$S{uAt}')
          .withBody(body)
          .expectStatus(200)
          .expectBodyContains(body.lastName);
      });
    });
  });

  describe('Post', () => {
    const createBody: CreatePostDto = {
      title: 'first post',
      body: 'body for first post',
    };
    const editBody: EditPostDto = {
      body: 'body of first post',
    };

    describe('Get empty post', () => {
      it('should get no post', () => {
        return pactum
          .spec()
          .get('/posts')
          .withBearerToken('$S{uAt}')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create Post', () => {
      it('should create a new post', () => {
        return pactum
          .spec()
          .post('/posts')
          .withBearerToken('$S{uAt}')
          .withBody(createBody)
          .expectStatus(201)
          .expectBodyContains(createBody.title)
          .stores('postId', 'id');
      });
    });

    describe('Get Posts', () => {
      it('should get all user post', () => {
        return pactum
          .spec()
          .get('/posts')
          .withBearerToken('$S{uAt}')
          .expectStatus(200)
          .expectJsonLength(1);
      });

      it('should return second page with no post', () => {
        return pactum
          .spec()
          .get('/posts')
          .withQueryParams('page', 2)
          .withBearerToken('$S{uAt}')
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });

    describe('Get Post by Id', () => {
      it('should get a user post', () => {
        return pactum
          .spec()
          .get('/posts/{id}')
          .withPathParams('id', '$S{postId}')
          .withBearerToken('$S{uAt}')
          .expectStatus(200)
          .expectBodyContains('$S{postId}');
      });
    });

    describe('Edit Post', () => {
      it('should update a post', () => {
        return pactum
          .spec()
          .patch('/posts/{id}')
          .withPathParams('id', '$S{postId}')
          .withBearerToken('$S{uAt}')
          .withBody(editBody)
          .expectStatus(200)
          .expectBodyContains(editBody.body);
      });
    });

    describe('Delete Post', () => {
      it('should delete a post', () => {
        return pactum
          .spec()
          .delete('/posts/{id}')
          .withPathParams('id', '$S{postId}')
          .withBearerToken('$S{uAt}')
          .expectStatus(204)
          .inspect();
      });

      it('should get no post', () => {
        return pactum
          .spec()
          .get('/posts')
          .withBearerToken('$S{uAt}')
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
