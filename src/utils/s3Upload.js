import s3 from '../config/aws.js';
import { v4 as uuidv4 } from 'uuid';

class S3UploadHelper {
  constructor() {
    this.s3 = s3;
  }

  async uploadFile(file, folder = 'general') {
    const key = `${folder}/${uuidv4()}-${file.originalname}`;
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    try {
      const result = await this.s3.upload(params).promise();
      return {
        url: result.Location,
        key: result.Key
      };
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async deleteFile(key) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    try {
      await this.s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async getSignedUrl(key, expiresIn = 3600) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn
    };

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  async uploadMultipleFiles(files, folder = 'general') {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return await Promise.all(uploadPromises);
  }
}

export default new S3UploadHelper();