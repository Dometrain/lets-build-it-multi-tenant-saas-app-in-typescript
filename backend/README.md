# Let's Build It: Multi Tenanted SaaS App in TypeScript
## Back End

The starting point for the front end is a new [AWS CDK](https://aws.amazon.com/cdk/) application with most of the example code removed.  Start by cloning [section 3](https://github.com/Dometrain/lets-build-it-multi-tenant-saas-app-in-typescript/tree/section/03).

## Useful commands

* `cdk deploy BackEndStack` Deploy both the back end stack
* `cdk deploy FrontEndStack` Deploy the front end stack
* `cdk deploy --all` Deploy both the front end and back end together

> IMPORTANT! You must deploy the backend stack to `us-east-1` since it provisions an AWS ACM certificate for CloudFront, all of which [must be in this region](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html).

## .env File

Create a new file in this directory called `.env` and add your secrets as environment variables before deploying:

```
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
STRIPE_PRIVATE_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
STRIPE_PRICE_ID=price_YOUR_ID
```

## cdk.json

Add your custom domain name and Hosted Zone ID into the `cdk.json` file:

```json
  "context": {
    "hostedZoneId": "<YOUR-HOSTED-ZONE-ID>",
    "domainName": "example.com",
```