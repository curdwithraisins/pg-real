# pg-real
A simple package to notify clients about Postgres updates in real-time through HTTP/SSE/WebSockets connection.

### Installation

```npm install pg-real```

### Usage

##### Connection

The central part of the packet is PostgreSQL. We need to have a connection to the DB. To instantiate new connection use **SubClient** class. THis class instantiate Client class of the **pg** module with an additional functionality for functions declaration:
```
const connectionString = `postgres://${user}:${password}@${host}:${port}}/${database}`;

const client = new SubClient(connectionString);

this.client.connect().then(console.log(`Connected to ${connectionString}`));
```

With this class we can add and remove functions and triggers to subscribe and unsubscribe from the notification and also specify functions with should be triggered on the event.

##### Subscriber

To manage subscriptions use Subscriber class. This class takes SubClient and use it to connect to the PostgreSQL.

````
const subscriber = new Subscriber(client);
````

This class sets notifier function for listener and send message to the listener based on the channel name. 

> Channel name of the listener should correspond to the channel name of the function.

To start listen to the events call **startListen** function with the list of the channels:

```
subscriber.startListen("channel_1"); // start listen to one channel
subscriber.startListen(["channel_1", "channel_2"]); // start listen to several channels

```



##### Response

To send response to the client on the event occurrence choose and create one of the connectors:

* HTTP
```
new HttpConnector(ctx.response);
```
* SSE
```
new SSEConnector(ctx.response);
```
* WebSocket
```
new SocketConnector(ctx.response);
```

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

As per Postgres documentation:
````
PostgreSQL provides these helper functions to retrieve information from event triggers.
````
For more information reference [an official documentation](https://www.postgresql.org/docs/12/functions-event-triggers.html).

The functions handle events from Postgres based on the preconfitions 

#### Triggers

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

###### Why uniques is important?

When we want to subscribe a client to a specific event based on the client specific data (id, filter, etc.) and we want to be triggered only for him, but we've already have a trigger on the same table we need to specify a unique trigger to not override an existent one. 

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

