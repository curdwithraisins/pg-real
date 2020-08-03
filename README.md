# pg-real
A simple module which helps to manage a pub/sub behavior with the PostgreSQL updates in the real-time through HTTP/SSE/WebSockets connection.

> **Note**: this lib is currently compatible only with a Postgres client from [node-postgres](https://github.com/brianc/node-postgres). If you use any other client this lib isn't suitable for you.

## Table of Content

* [Installation](#installation)
* [Usage](#usage)
    * [Connection](#connection)
    * [Response](#response)
    * [Subscriber](#subscriber)
* [Client](#client)
* [Functions](#functions)
* [Triggers](#triggers)
    * [Why uniques is important?](#why-uniques-is-important)
* [Connectors](#connectors)
    * [HTTP/HTTPS](#httphttps)
    * [SSE](#sse)
    * [WebSockets](#websockets)
    
## Installation

```npm install pg-real```

## Usage

### Connection

This module supports only PostgreSQL. 

To create connection to the db use **SubClient** class. It inherits **pg** module's Client class with an additional functionality for Functions and Triggers declaration:

With this class we can add and remove functions and triggers to subscribe and unsubscribe from the notifications and also specify functions with should be triggered on the specific events.

### Response

To send response to the client on the event occurrence choose and create one of the connectors:
```javascript
new HttpConnector(ctx.response);
new SSEConnector(ctx.response);
new SocketConnector(ctx.response);
```

### Subscriber

To manage subscriptions use **Subscriber** class. This class takes **SubClient** instance as an input parameter and use it to connect to the PostgreSQL.

````javascript
const subscriber = new Subscriber(client);
````

**SubClient** includes several useful methods:

To subscribe to the events use **subscribe** function to link channel and corresponding receiver. If a list of channels aren't specified the corresponding receiver will be linked to all of them. Receiver could be:
* function;
* stream;
* the send method of one of the [connectors](#connection).

```javascript
const fn = (channel, payload) => { console.log(channel, payload); };
subscriber.subscribe("channel_1", fn);
subscriber.subscribe("channel_2", new PassThrough());
subscriber.subscribe(["channel_1", "channel_2"], connector.send);
```

This class sets notifier function for listener and send message to the listener based on the channel name. 

> Channel name of the listener should correspond to the channel name of the function.

To start listen to the events call **startListen** with the list of the channels:

```javascript
subscriber.startListen("channel_1");
subscriber.startListen(["channel_1", "channel_2"]);
```

To stop listen to the events call **stopListen**  with the list of the channels. If no channels are specified, all listeners are unsubscribed:

```javascript
subscriber.stopListen("channel_1");
subscriber.stoptListen(["channel_1", "channel_2"]);
subscriber.stoptListen();
```

## Client

A PostgreSQL Client is a basic thing we need for notifier. We recommend to use our **SubClient** from this lib but you also can use your own client.

```javascript
const connectionString = `postgres://${user}:${password}@${host}:${port}}/${database}`;
const client = new SubClient(connectionString);
this.client.connect().then(console.log(`Connected to ${connectionString}`));
```

**SubClient** includes several useful methods:
* **setFunctions**:*string | string[]* - takes query to create a function (go to [Functions](#functions) section to get more info);

```javascript
const { function } = Functions.afterAll('public', 'test');
client.setFunctions(function);
```

* **dropFunctions**:*string | string[]* - takes function name and drop it;

```javascript
const { name } = Functions.afterAll('public', 'test');
client.dropFunctions(name);
```

* **setTrigger**:*string | string[]* - takes query to create a trigger (go to [Triggers](#triggers) section to get more info);

```javascript
const { trigger } = Triggers.afterAll({
   schema: 'public', 
   table: 'test' 
});
client.setTrigger(trigger);
```

* **removeTriggers**:*string | string[]* - takes trigger name and drop it, Require schema and table name;

```javascript
const { name } = Triggers.afterAll({
   schema: 'public', 
   table: 'test' 
});
client.removeTriggers(name, 'public', 'test');
```

* **setListeners**:*string | string[]* - take channel name and activate listening;

```javascript
const { channel } = Functions.afterAll('public', 'test');
client.setListeners(channel);
```

* **removeListeners**:*string | string[]* - take channel name and stop listening;

```javascript
const { channel } = Functions.afterAll('public', 'test');
client.removeListeners(channel);
```

## Functions

As per Postgres documentation:
````
PostgreSQL provides these helper functions to retrieve information from event triggers.
````
For more information reference [an official documentation](https://www.postgresql.org/docs/12/functions-event-triggers.html).

The functions handle events from Postgres based on the preconfitions 

## Triggers

As per Postgres documentation:
````
PL/pgSQL can be used to define trigger functions on data changes or database events. A trigger function is created with the CREATE FUNCTION command, declaring it as a function with no arguments and a return type of trigger (for data change triggers) or event_trigger (for database event triggers).
````
For more information reference [an official documentation](https://www.postgresql.org/docs/12/plpgsql-trigger.html).

pg-real uses triggers to subscribe to the database changes. User can both specify own functions or use predefined general methods. 

For predefined triggers database table name is required. You also can set schema path, 'public' schema is used by default. Columns names are optional and could be used for more accuracy. Trigger generators also take options parameters.

The list of trigger generators:
* **afterAll**: **schema: string, table: string, columns: string | string[], options: ITriggerOptions** - emits after any change on the table or column if defined;
* **beforeAll**: **schema: string, table: string, columns: string | string[], options: ITriggerOptions** - emits before any change on the table or column if defined;
* **afterInsert**: **schema: string, table: string, columns: string | string[], options: ITriggerOptions** - emits after insert to the table;
* **beforeInsert**: **schema: string, table: string, columns: string | string[], options: ITriggerOptions** - emits before insert to the table;
* **afterUpdate**: **schema: string, table: string, columns: string | string[], options: ITriggerOptions** - emits after update on the table or column if defined;
* **beforeUpdate**: **schema: string, table: string, columns: string | string[], options: ITriggerOptions** - emits before any change on the table or column if defined;
* **afterDelete**: **schema: string, table: string, columns: string | string[], options: ITriggerOptions** - emits after delete on the table or column if defined;
* **beforeDelete**: **schema: string, table: string, columns: string | string[], options: ITriggerOptions** - emits before delete on the table or column if defined;

where options could be:
* **unique**: boolean - create a unique trigger name.

#### Why uniques is important?

When we want to subscribe a client to a specific event based on the client specific data (id, filter, etc.) and we want to be triggered only for him, but we've already have a trigger on the same table we need to specify a unique trigger to not override an existent one. 

## Connectors

Notifications from Postgres could be sent with HTTP/HTTPS, SSE or WebSockets. You can create your own connection or use one of the supplied classes.

### HTTP/HTTPS

Use **HttpConnector** to create new HTTP connection. Response object should be supplied as an input parameter. 

Values:
* **res** - response object;

Methods:
* **send**: **<payload: string, channel: string>** - sends message to the user. Channel is an optional.

**Example:**
````
1) new HttpConnector(ctx.response).send('start');

2) new HttpConnector(ctx.response).send('start', 'after_insert_users');
````

### SSE

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
````

### WebSockets

Use **SocketConnector** to create new WebSocket connection. Socket object should be supplied as an input parameter. 

**Note:** Supports Express and Koa.

Values:
* **socket** - socket object;

Methods:
* **send**: **<payload: string, channel: string>** - sends message to the socket. Channel is an optional.

**Example:**
````
1) new SocketConnector(socket).send('start');

2) new SocketConnector(socket).send('start', 'after_insert_users');
````
