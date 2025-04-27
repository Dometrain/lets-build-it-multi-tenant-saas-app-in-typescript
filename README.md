# Let's Build It: Multi Tenanted SaaS App in TypeScript

Welcome to the ["Let's Build It: Multi Tenanted SaaS App in TypeScript"](https://dometrain.com/course/lets-build-it-multi-tenanted-saas-app-in-typescript/?ref=github) course on Dometrain! 

## Getting Started

On the course you will build a full stack SaaS application in TypeScript.  The code is ordered into three folders in this repository

- [./backend](/backend/README.md) - The back end (NodeJS/AWS CDK)
- [./frontend](/frontend/README.md) - The front end (React)
- [./common](/common) - TypeScript types & code shared across the stack

## Sections

The `main` branch contains the final working version of the project.  There are also branches you can check out as starting points for each section:

1. [Starting point for Front End (branch 01)](/tree/section/01) - A new Vite application with most of the demo code removed
2. [Mocked Front End, No Auth (branch 02)](/tree/section/02) - A working front end using mocked API responses
3. [Starting Point for Back End (branch 03)](/tree/section/03) - A new AWS CDK application with some helper Constructs 
4. [Backend services created (branch 04)](/tree/secetion/04) - Backend services created (except API)
5. [Hosted UI For Authentication (branch 05)](/tree/section/05) - Hosted UI Configured and Integrated with FrontEnd
6. [API Created (branch 06)](/tree/section/06) - Back end created with authentication and API logic, FrontEnd now works with no mocks
7. [Stripe Integration Added (branch 07)](/tree/section/07) - Stripe added to both front end and back end to process 

To use a branch, clone this repository and switch to the required section:

```sh
git clone https://github.com/Dometrain/lets-build-it-multi-tenant-saas-app-in-typescript.git

cd lets-build-it-multi-tenant-saas-app-in-typescript

# Check out the branch for the starting point of required section...
git checkout section/00
```

## Prerequisites

In order to deploy this project you will need:

* An AWS Account
* AWS CLI
* Bootstrapped AWS CDK
* A domain name (optional)
* A Stripe account (optional)

### Setting up an AWS Account

Visit [https://aws.amazon.com](https://aws.amazon.com/) to set up a new account.

> Everything you deploy in this project will fit well within the AWS free tier, _except_ for a Route53 Hosted Zone which costs $0.50 per month.  Realistically you could run this multi tenanted SaaS application for approximately 20 customers before reaching the limits of the AWS Free Tier, depending on usage.

### Setting Up The AWS CLI

This project will be deployed from the command line using the AWS CLI tool.  After setting up your AWS account, follow this guide to download the AWS CLI and connect it to your AWS account.

https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html

Test your CLI connection with:

```sh
aws sts get-caller-identity
```

And check the output:

```json
{
    "UserId": "<YOUR USER ID>",
    "Account": "<YOUR AWS ACCOUNT ID",
    "Arn": "arn:aws:iam::<ACCOUNT-ID>:user/<IAM-USER>"
}
```

The project will be deployed to the [us-east-1](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html) region.  Due to restrictions on AWS ACM certificates you must deploy to this region.  You can set the default region with `export AWS_REGION=us-east-1`


> **NOTE** CLI commands referenced in this course will use [bash](https://www.gnu.org/software/bash/).  If you are using a Windows machine you should [install WSL 2.0](https://learn.microsoft.com/en-us/windows/wsl/install) to follow along.  You _can_ deploy the application using the standard Windows terminal but some of the commands refernced in the videos may not work.

### Installing the AWS CDK

You will be creating AWS resources in TypeScript using the [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html).  You can install this globally with

```sh
npm install -g aws-cdk@2.178.2

cdk bootstrap
```

### Using a Custom Domain

To get the most out of this course, it is recommended to register a custom domain and link it to your AWS account.

1. Register a domain via any provider (eg [Namecheap](https://www.namecheap.com/))
2. Create a public hosted zone in Route53 ([follow this guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html))
3. Link your custom domain to Route53 nameservers ([guide for Namecheap](https://www.namecheap.com/support/knowledgebase/article.aspx/10371/2208/how-do-i-link-my-domain-to-amazon-web-services/))
4. Make a note of your hosted zone id

```sh
 aws route53 list-hosted-zones --output text

 {
    "HostedZones": [
        {
            "Id": "/hostedzone/<YOUR-HOSTED-ZONE-ID>", # <-- find your ID here
            "Name": "mysaasproduct.com.",
        }
    ]
 }
```

### Processing Payments with Stripe

The course takes you through integrating the payment processor Stripe so you can start selling your SaaS!

Create an account with Stripe here:
[https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)

You will use your Stripe account in the later sections of the course.