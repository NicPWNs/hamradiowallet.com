/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "hamradiowallet",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: { region: "us-east-1" },
      },
    };
  },
  async run() {
    const wwdrSecret = new sst.Secret("WWDRCert");
    const certSecret = new sst.Secret("SignerCert");
    const keySecret = new sst.Secret("SignerKey");

    const passBucket = new sst.aws.Bucket("PassBucket", {
      public: false,
    });

    const dataBucket = new sst.aws.Bucket("DataBucket", {
      public: false,
    });

    // Production API
    if ($app.stage === "production") {
      const api = new sst.aws.ApiGatewayV2("MyApi", {
        domain: "api.hamradiowallet.com",
        cors: {
          allowMethods: ["GET"],
          allowOrigins: ["https://hamradiowallet.com", "http://localhost:3000"],
        },
      });

      api.route("GET /create_pass", {
        link: [passBucket, dataBucket, wwdrSecret, certSecret, keySecret],
        handler: "src/create_pass.handler",
        memory: "2560 MB",
        timeout: "60 seconds",
        copyFiles: [{ from: "src/hamradiowallet.pass" }],
      });

      api.route("GET /get_pass", {
        link: [passBucket],
        handler: "src/get_pass.handler",
      });
    }

    // Development API
    if ($app.stage === "nic") {
      const dev = new sst.aws.ApiGatewayV2("DevApi", {
        domain: "dev.hamradiowallet.com",
        cors: {
          allowMethods: ["GET"],
          allowOrigins: ["https://hamradiowallet.com", "http://localhost:3000"],
        },
      });

      dev.route("GET /create_pass", {
        link: [passBucket, dataBucket, wwdrSecret, certSecret, keySecret],
        handler: "src/create_pass.handler",
        memory: "2560 MB",
        timeout: "60 seconds",
        copyFiles: [{ from: "src/hamradiowallet.pass" }],
      });

      dev.route("GET /get_pass", {
        link: [passBucket],
        handler: "src/get_pass.handler",
      });
    }

    new sst.aws.Cron("MyCronJob", {
      schedule: "cron(0 0 ? * MON *)",
      job: { handler: "src/cron.handler", link: [dataBucket] },
    });

    new sst.aws.Nextjs("MyWeb", {
      domain: {
        name: "hamradiowallet.com",
        redirects: ["www.hamradiowallet.com"],
      },
    });
  },
});
