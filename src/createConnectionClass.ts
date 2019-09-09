import { Connection } from '@elastic/elasticsearch';
import * as AWS from 'aws-sdk';
import * as aws4 from 'aws4';
import * as http from 'http';

interface RequestOptions extends http.ClientRequestArgs {
  asStream?: boolean;
}

export function createConnectionClass(awsConfig: AWS.Config): any {
  return class extends Connection {
    public request(
      params: RequestOptions,
      cb: (err: Error | null, response: http.IncomingMessage | null) => void
    ): http.ClientRequest {
      const originalMakeRequest = this.makeRequest;

      this.makeRequest = (
        reqParams: http.ClientRequestArgs
      ): http.ClientRequest => {
        reqParams.host = this.url.host;
        // @ts-ignore
        reqParams.region = awsConfig.region;

        aws4.sign(reqParams, awsConfig.credentials);

        return originalMakeRequest(reqParams);
      };

      return super.request(params, cb);
    }
  };
}
