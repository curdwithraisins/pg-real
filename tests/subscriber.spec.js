/**
 * Subscriber tests
 */
const { expect } = require('chai');
const { before } = require('mocha');
const { createStubInstance } = require('sinon');
const { keys } = require('lodash');

const { Subscriber } = require('../bin/subscriber');
const { SubClient } = require('../bin/postgres/client');

describe('Subscriber', () => {
    let client;
    let service;

    before(() => {
        client = createStubInstance(SubClient);
        service = new Subscriber(client);
    });

    describe('subscribe', () => {
        before(() => {
            service.listeners = {};
        });

        it('should add new channel', () => {
            const fn = () => {};
            service.subscribe('test', fn);
            expect(service.listeners[ 'test' ]).to.exist;
            expect(service.listeners[ 'test' ][ keys(service.listeners[ 'test' ])[ 0 ] ]).to.eql(fn);
        });

        it('should add subscriber to existing channel', () => {
            service.subscribe('test', () => {
            });
            expect(keys(service.listeners[ 'test' ]).length).to.eql(2);
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

        it('should remove one id from channel', () => {
            service.unsubscribe('some_channel_1', '2');
            delete ch1[ 'some_channel_1' ][ '2' ];
            expect(service.listeners).to.eql({ ...ch1, ...ch2 });
        });

        it('should remove channel', () => {
            service.unsubscribe('some_channel_1');
            expect(service.listeners).to.eql(ch2);
        });

        it('should throw if channel or callback does\'t exist', () => {
            service.listeners = {};
            expect(() => service.unsubscribe('test')).to.throw('Channel test does not exist.');
        });
    });

    describe('startListen', () => {
        let setListenersSpy;

        before(() => {
            service.listeners = {};
            setListenersSpy = client.setListeners.withArgs(['some_channel']).returns(Promise.resolve());
        });

        it('should call setListeners', async () => {
            await service.startListen('some_channel');
            expect(setListenersSpy.calledWith(['some_channel']));
        });

        it('should add channel to listeners if doesn\'t exist' , async () => {
            await service.startListen('some_channel');
            expect(service.listeners['some_channel']).to.eql({});
        });
    });

    describe('stopListen', () => {
        let stopListenersSpy;

        before(() => {
            stopListenersSpy = client.dropListeners.returns(Promise.resolve());
        });

        beforeEach(() => {
            service.listeners = {
                'some_channel_1': {},
                'some_channel_2': {},
            };
        });

        it('should unlisten all channels', async () => {
            await service.stopListen();
            expect(service.listeners).to.eql({});
            expect(stopListenersSpy.calledWith(['some_channel_1', 'some_channel_2']));
        });

        it('should unlisten one channel', async () => {
            await service.stopListen('some_channel_1');
            expect(service.listeners).to.eql({ 'some_channel_2': {} });
            expect(stopListenersSpy.calledWith(['some_channel_2']));
        });

        it('should unlisten list of channels', async () => {
            await service.stopListen([ 'some_channel_1', 'some_channel_2' ]);
            expect(service.listeners).to.eql({});
        });
    });
});