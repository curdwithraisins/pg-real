/**
 */
import { Client } from 'pg';
import SSEStream from './stream';
const { PassThrough } = require('stream');

export function connect(cl: Client, res: any) {
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    res.body = SSEStream.create();
};

const createStream = () => {

};