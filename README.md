# pg-real
A simple module which helps to manage a pub/sub behavior with the PostgreSQL updates in the real-time through HTTP/SSE/WebSockets connection.

> **Note**: this lib is currently compatible only with a Postgres client from [node-postgres](https://github.com/brianc/node-postgres). If you use any other client this lib isn't suitable for you.

## Table of Content

* [Installation](#installation)
* [Usage](#usage)
    * [Initialization](#initialization)
    * [Set Functions and Triggers](#set-functions-and-triggers)
    * [Connection](#connection)
    * [Subscription](#subscription)
    * [Client side](#client-side)
    * [Unsubscription](#unsubscription)
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

To install package, use: ```npm install pg-real```.

## Usage

### Initialization

To establish a connection to the DB use **SubClient** class. It inherits Client class from [node-postgres](https://github.com/brianc/node-postgres) module with an additional functionality ti set **Functions**, **Triggers**, and **Listeners**.

Pass connection configuration to the class during instantiation to set desired settings. Review [node-postgres Client](https://node-postgres.com/api/client) documentation to get more information how to setup Postgres Client.

**Example:**

```javascript
const { user, password, host, port, database } = config;
const connectionString = `postgres://${user}:${password}@${host}:${port}/${database}`;
const client = new SubClient(connectionString);
client.connect();
```

### Set Functions and Triggers

To create Function, use one of the predefined functions from the list of [functions](#functions) or create your own.

**Note:** If you create your owm function, use a name of a notification channel to subscribe on the Postgres updates.

**Example:**

```javascript
const customFunction = Functions.custom('test_channel_name');
const afterAllFunction = Functions.afterAll('public', 'test');

const own_channel_name = 'own_channel_name';
const ownFunction = `
   CREATE OR REPLACE FUNCTION ${own_channel_name}_notifier() RETURNS TRIGGER AS $$
      BEGIN
         IF TG_OP = 'UPDATE' THEN
            PERFORM pg_notify(CAST('${own_channel_name}' AS text), row_to_json(NEW)::text);
         END IF;
         RETURN NEW;
      END;
   $$ LANGUAGE "plpgsql";`;
```

To create Trigger, use one of the predefined triggers from the list of [triggers](#triggers) or create your own.

**Note:** If you create your owm trigger, use a name of a corresponding function to set it on event.
**Note:** For custom trigger triggerName should be equal to the channel name.

**Example:**

```javascript
const customTrigger = Triggers.custom({schema: 'public', table: 'test', triggerName: 'own_channel_name' }, {before: false, update: true, when: "OLD.id = '12345'"});
const afterAllTrigger = Triggers.afterAll({schema: 'public', table: 'test'}, { when: "OLD.id = '12345'" });

const own_trigger_name = 'own_channel_name';
const ownFunction = `
   DROP TRIGGER IF EXISTS ${own_trigger_name} ON public.test;
   CREATE TRIGGER ${own_trigger_name} AFTER INSERT OR UPDATE OR DELETE ON public.test FOR EACH ROW WHEN OLD.id = '12345' EXECUTE PROCEDURE ${own_channel_name}_notifier();`;   
```

After creation set function to the client using **setFunction** and **setTrigger** methods of the **SubClient** instance.

**Example:**

```javascript
await client.setFunctions(customFunction.function);
await client.setTriggers(customTrigger.trigger);
```

### Connection

You can initialize any kind of a connection using **pg-real** module: **HTTP(S)**, **SSE**, and **WebSockets**. Each connection class takes response context as an input parameters during instantiation.

It's not required to use **pg-real** connectors. You can set all the headers and statuses by yourself, just ensure to implement a correct subscription callback.

**Example:**

```javascript
const connection = new SSEConnector(ctx.response).send('start');
connection.send(channel, payload);
```

### Subscription

To subscribe on the Postgres events use **Subscriber** class. Pass **SubClient** or [node-postgres Client](https://node-postgres.com/api/client) during instantiation of the class.

**Example:**

```javascript
const subscriber = new Subscriber(client);
```

To kick listening on a trigger use **startListen** method. Postgres starts consume events for a corresponding trigger and call notifier.

**Example:**

```javascript
subscriber.startListen(customTrigger.name);
```

After that you can subscribe on the events from notifier.

**Note:** We are highly recommend you to store subscription id for the farther ability to unsubscribe.

**Example:**

```javascript
  const afterAllSubscribtionId = await subscriber.subscribe(afterAllFunction.channel, connection.send.bind(connection));
  const customSubscribtionId = await subscriber.subscribe(customFunction.channel, (channel, payload) => {
      /**
      * Do what you need here
      * For instance, connection.send(channel, payload)
      * */
  });
```

### Client side

From client side, make request to API. Specify any information which could help to implement a correct subscription.

**Example:**

```javascript
const source = new EventSource(`http://${host}:${port}/${endpoint}?id=12345`);

source.addEventListener('message', function (event) {
    console.log(JSON.parse(event.data));
}, false);

source.addEventListener('own_channel_name', function (event) {
    console.log(JSON.parse(event.data));
}, false);
```

### Unsubscription

Try always unsubscribe from the triggers: on the end of connection, after client unsubscribe, etc.

**Example:**

```javascript
ctx.request.on('close', () => {
    subscriber.unsubscribe(customFunction.channel, customSubscribtionId);
});

router.post('/unsubscribe', (ctx) => {
    const { channel, id } = ctx.request.body;
    subscriber.unsubscribe(channel, id);
});
```

## Subscriber

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

###Functions

As per Postgres documentation:
````
PostgreSQL provides these helper functions to retrieve information from event triggers.
````
For more information reference [an official documentation](https://www.postgresql.org/docs/12/functions-event-triggers.html).

The functions handle events from Postgres based on the preconfitions 

### Triggers

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

### Why uniques is important?

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
* **send**: **<payload: string, channel: string>** - sends message to the stream. Channel is an optional.

**Example:**
````
1) new SSEConnector(ctx.response).send('start');

2) new SSEConnector(ctx.response).send('start', 'after_insert_users');
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
