const SubscriptionService = require('../lib/subscription.ts');
const PGClient = require('../lib/postgres/client');
const expect = require('chai').expect;
const {before} = require('mocha');

describe('SubscriptionService', () => {
    let client;
    let service;

   before(() => {
       client = new PGClient();
       service = new SubscriptionService();
   })
});