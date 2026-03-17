# Multi-Database Login Mechanism

This document explains how the application handles multiple database logins within a single project, allowing users to authenticate against different database instances dynamically.

## Architecture Highlights

The system uses a combination of dynamic connection pooling and Node.js's `AsyncLocalStorage` to manage database contexts per request.

### 1. Database Credentials Map (`databaseCredentialsMap.js`)
All available database servers and their credentials (host, user, password, port) are centralized in `databaseCredentialsMap.js`. This allows the application to connect to different physical servers based on the user's selection at login.

### 2. Dynamic Connection Pooling (`db.connect.js`)
The `getPool(dbId, dbName)` function is responsible for:
- Checking if a connection pool for a specific server and database already exists in a local cache (`__poolsMap`).
- Creating a new `mysql2` pool and a `Sequelize` instance if they don't exist.
- Registering models on the new Sequelize instance using `registerModels`.

### 3. Database Context Management (`AsyncLocalStorage`)
The `dbStore` (an instance of `AsyncLocalStorage`) is used to store the connection state for the duration of an asynchronous operation (like a login or a standard request).

```javascript
export const dbStore = new AsyncLocalStorage();
```

### 4. Database Proxy (`dbProxy`)
To simplify development, the application exports a default proxy (`dbProxy`). This proxy automatically retrieves the active connection from `dbStore`'s current context. When you access a property on the proxy (like a model name), it dynamically resolves it from the active Sequelize instance.

## Login Flow

When a user logs in, the `loginController` performs the following steps:

1.  **Extract Configuration**: It receives `username`, `password`, and `dbConfig` (which includes `dbServerId` and `dbName`) from the request body.
2.  **Initialize Pool**: It calls `getPool(dbConfig.dbServerId, dbConfig.dbName)` to ensure a connection to the requested database is ready.
3.  **Run in Context**: It uses `dbStore.run()` to execute the authentication check within the context of the selected database.

```javascript
// From loginController.js
await dbStore.run({ pool: poolPromise, sequelizeInstance }, async () => {
    [result] = await authModel.checkUserCredentials(username, password);
});
```

4.  **JWT Issue**: If successful, it generates a JWT containing the `dbConfig`. This ensures that subsequent requests from this user can also be routed to the correct database by initializing the context using the information in the token.

## Why this approach?

-   **Scalability**: New databases and servers can be added simply by updating `databaseCredentialsMap.js`.
-   **Isolation**: Each user stays within the database they selected at login.
-   **Efficiency**: Connections are pooled and cached, preventing excessive database overhead.
-   **Developer Experience**: Using a proxy means developers don't have to manually pass database connection objects through every function call.
