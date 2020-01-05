const { Subscription } = require('../dist/subscription');
const { PGClient } = require('../dist/postgres/client');
const { expect } = require('chai');
const { before } = require('mocha');
const { spy } = require('sinon');
const { keys } = require('lodash');
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

        it('should throw if channel doesn\'n exist', () => {
            expect(() => service.stopListen(['some_channel'])).to.throw('Channel doesn\'t exist.');
        });
    });

    describe('subscribe', () => {
        before(() => {
            service.listeners = {};
        });

       it('should add new channel', () => {
           const fn = () => {};
           service.subscribe('test', fn);
           expect(service.listeners['test']).to.exist;
           expect(service.listeners['test'][keys(service.listeners['test'])[0]]).to.eql(fn);
       });

        it('should add subscriber to existing channel', () => {
            service.subscribe('test', () => {});
            expect(keys(service.listeners['test']).length).to.eql(2);
        });

        it('should throw if channel or callback does\'t exist', () => {
            expect(() => service.subscribe()).to.throw('Require channel and callback.');
        });
    });

    describe('unsubscribe', () => {
        const ch1 = {
            'some_channel_1': {
                '1': () => {},
                '2': () => {},
            }
        };
        const ch2 = {
            'some_channel_2': {
                '2': () => {},
            }
        };

        beforeEach(() => {
            service.listeners = { ...ch1, ...ch2 };
        });

        it('should remove channel', () => {
            service.unsubscribe('some_channel_1', '2');
            delete ch1['some_channel_1']['2'];
            expect(service.listeners).to.eql({...ch1, ...ch2});
        });

        it('should remove channel', () => {
            service.unsubscribe('some_channel_1');
            expect(service.listeners).to.eql(ch2);
        });

        it('should throw if channel or callback does\'t exist', () => {
            service.listeners = {};
            expect(() => service.unsubscribe('test')).to.throw('Channel doesn\'t exist.');
        });
    });
});