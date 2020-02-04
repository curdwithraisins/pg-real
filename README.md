#pg-real
A simple package to notify clients about Postgres updates in real-time through HTTP/SSE/WebSockets connection.

###Installation

```npm install pg-real```

###Usage

####Client

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

####Functions

####Triggers