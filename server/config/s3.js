import https from "https";
import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";

const allowInvalidTls =
    process.env.AWS_TLS_ALLOW_INVALID_CERTS === "true" ||
    process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === "true";

const s3ClientConfig = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
};

if (allowInvalidTls) {
    s3ClientConfig.requestHandler = new NodeHttpHandler({
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
}

const s3Client = new S3Client(s3ClientConfig);

export function getS3Bucket() {
    return process.env.AWS_BUCKET_NAME;
}

export function getS3Region() {
    return process.env.AWS_REGION;
}

export default s3Client;
