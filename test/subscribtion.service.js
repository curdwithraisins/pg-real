const { Subscription } = require('../dist/subscription');
const { PGClient } = require('../dist/postgres/client');
const { expect } = require('chai');
const { before } = require('mocha');
const { spy } = require('sinon');
const pgMock = require('./pgMock');

describe('SubscriptionService', () => {
    let client;
    let service;

   before(() => {
       client = new PGClient();
       client.setClient(pgMock);
       service = new Subscription(client);
   });

    describe('startListen', () => {
        let listenSpy;
        let setListenersSpy;

        before(() => {
            listenSpy = spy(client, 'listen');
            setListenersSpy = spy(client, 'setListeners');
        });

        it('should call listen', () => {
            service.startListen();
            expect(listenSpy.called);
            expect(setListenersSpy.notCalled);
        });

        it('should call setListeners', () => {
            service.startListen('some_channel');
            expect(listenSpy.called);
            expect(setListenersSpy.calledWith(['some_channel']));
        });
    });

    describe('stopListen', () => {
        let unlistenSpy;

        before(() => {
            unlistenSpy = spy(client, 'unlisten');
        });

        beforeEach(() => {
            service.listeners = {
                'some_channel_1': {},
                'some_channel_2': {},
            }
        });

        it('should unlisten all channels', () => {
            service.stopListen();
            expect(service.listeners).to.eql({});
            expect(unlistenSpy.calledOnceWith('some_channel_1'));
        });

        it('should unlisten one channel', () => {
            service.stopListen('some_channel_1');
            expect(service.listeners).to.eql({'some_channel_2': {}});
            expect(unlistenSpy.calledOnceWith('some_channel_1'));
        });

        it('should unlisten list of channels', () => {
            service.stopListen(['some_channel_1', 'some_channel_2']);
            expect(service.listeners).to.eql({});
        });

        it('should return error if channel doesn\'n exist', () => {
            expect(() => service.stopListen(['some_channel'])).to.throw('Channel doesn\'t exist.');
        });
    });

    describe('subscribe', () => {
       it('should add new channel', () => {
           service.subscribe('test');
           expect(service.listeners['test']).to.exist;
       });
    });
});