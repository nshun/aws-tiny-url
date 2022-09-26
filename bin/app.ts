#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TinyUrlStack } from '../lib/tinyurl-stack';

const app = new cdk.App();
new TinyUrlStack(app, 'TinyUrlStack');
