#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BackEndStack } from '../lib/BackEndStack';
import * as dotenv from 'dotenv';

dotenv.config();


const app = new cdk.App();

const backEnd = new BackEndStack(app, 'SaaS-BackEnd', { 
  domainName: app.node.tryGetContext('domainName'),
  hostedZoneId: app.node.tryGetContext('hostedZoneId'),
  localEnv: {
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY!,
    STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID!
  }
});
