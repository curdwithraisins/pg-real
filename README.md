# pg-real
A simple package to notify clients about Postgres updates in real-time through HTTP/SSE/WebSockets connection.

### Installation

```npm install pg-real```

### Usage

#### Client

A Postgres Client is a basic thing we need for notifier. We recommend you to use our **SubscriptionClient** from this lib but you an also use your own client.

> **Note**: this lib is currently compatible only with a Postgres client from [node-postgres](https://github.com/brianc/node-postgres). If you use aby other client this lib isn't suitable for you.

**SubscriptionClient** includes several useful methods:
* **setFunctions**:*string | string[]* - takes query to create a function (go to [Functions](#functions) section to get more info);
* **dropFunctions**:*string | string[]* - takes function name and drop it;
* **setTrigger**:*string | string[]* - takes query to create a trigger (go to [Triggers](#triggers) section to get more info);
* **removeTriggers**:*string | string[]* - takes trigger name and drop it, Require schema and table name;
* **setListeners**:*string | string[]* - take channel name and activate listening;
* **removeListeners**:*string | string[]* - take channel name and stop listening;
* **setTriggersAndListeners**:*ITrigger | ITrigger[]* - takes linked triggers and listeners, create triggers and start listening on them;
* **startListen**:*any* - takes function, connection etc and send notification from Postgres to it when it occurs.

**SubscriptionClient** extends basic [node-postgres](https://github.com/brianc/node-postgres) client. It takes all the same parameters and doesn't override any of its methods. Refers original documentation to get more information about this library.

```javascript
import { SubscriptionClient } from 'pg-real';
const subscriptionClient = new SubscriptionClient(<client options>);
```

#### Functions

#### Triggers

#### Connectors

Notifications from Postgres could be sent with HTTP/HTTPS, SSE or WebSockets. You can create your own connection or use one of the supplied classes.

##### HTTP/HTTPS



##### SSE

Use **SSEConnector** to create new SSE connection. Response object should be supplied as an input parameter. 

**Note:** Supports Express and Koa.

Values:
* **res** - response object;

Methods:
* **initStream** - sets status(200), headers and creates stream;
* **send**: **<payload: string, channel: string>** - sends message to the stream. Channel is an optional.

**Example:**
````
1) new SSEConnector(ctx.response).initStream().send('start');

2) new SSEConnector(ctx.response).initStream().send('start', 'after_insert_users');

3) new SSEConnector(ctx.response).initStream().res.body.write('data: start');
````

##### WebSockets

