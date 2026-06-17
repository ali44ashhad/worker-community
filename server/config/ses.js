import https from "https";
import { SESClient } from "@aws-sdk/client-ses";
import { NodeHttpHandler } from "@smithy/node-http-handler";

const allowInvalidTls =
    process.env.AWS_TLS_ALLOW_INVALID_CERTS === "true" ||
    process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === "true";

const sesClientConfig = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
};

if (allowInvalidTls) {
    sesClientConfig.requestHandler = new NodeHttpHandler({
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
}

const sesClient = new SESClient(sesClientConfig);

export function getSesFromEmail() {
    return (process.env.SES_FROM_EMAIL || "").trim();
}

export default sesClient;
