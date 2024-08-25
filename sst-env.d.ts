/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "DataBucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "DevApi": {
      "type": "sst.aws.ApiGatewayV2"
      "url": string
    }
    "MyWeb": {
      "type": "sst.aws.Nextjs"
      "url": string
    }
    "PassBucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "SignerCert": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "SignerKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "WWDRCert": {
      "type": "sst.sst.Secret"
      "value": string
    }
  }
}
export {}
