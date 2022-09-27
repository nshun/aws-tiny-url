#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HostingStack } from '../lib/hosting-stack';

const app = new cdk.App();
new HostingStack(app, 'TinyUrlHostingStack', {});
