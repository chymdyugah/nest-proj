import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private region: string;
  private s3: S3Client;

  constructor(private config: ConfigService) {
    this.region = config.get('S3_REGION_NAME');
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.config.get(
          'AWS_ACCESS_KEY',
        ),
        secretAccessKey: this.config.get(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async uploadToS3(
    file: Express.Multer.File,
    key: string,
  ) {
    const bucket = this.config.get(
      'S3_BUCKET_NAME',
    );
    const data: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: bucket,
      Key: key,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    try {
      const response: PutObjectCommandOutput =
        await this.s3.send(
          new PutObjectCommand(data),
        );
      if (
        response.$metadata.httpStatusCode == 200
      ) {
        return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
      }
      throw new Error(
        'Image upload to s3 failed.',
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
