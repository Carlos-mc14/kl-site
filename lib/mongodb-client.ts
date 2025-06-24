import { MongoClient, type MongoClientOptions } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI

// Enhanced connection options with pooling
const options: MongoClientOptions = {
  maxPoolSize: 10, // Maximum number of connections in the connection pool
  minPoolSize: 2, // Minimum number of connections in the connection pool
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timing out
  connectTimeoutMS: 10000, // How long to wait for a connection to be established before timing out
  heartbeatFrequencyMS: 10000, // How often to check the status of the connection
  retryWrites: true, // Retry writes that fail due to network issues
  retryReads: true, // Retry reads that fail due to network issues
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Connection monitoring
function setupConnectionMonitoring(client: MongoClient) {
  client.on("connectionPoolCreated", () => {
    console.log("MongoDB connection pool created")
  })

  client.on("connectionPoolClosed", () => {
    console.log("MongoDB connection pool closed")
  })

  client.on("connectionCreated", () => {
    console.log("MongoDB connection created")
  })

  client.on("connectionClosed", () => {
    console.log("MongoDB connection closed")
  })

  client.on("serverHeartbeatSucceeded", () => {
    console.log("MongoDB server heartbeat succeeded")
  })

  client.on("serverHeartbeatFailed", (event) => {
    console.error("MongoDB server heartbeat failed:", event.failure)
  })
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClient) {
    client = new MongoClient(uri, options)
    setupConnectionMonitoring(client)
    globalWithMongo._mongoClient = client
  }
  client = globalWithMongo._mongoClient

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  setupConnectionMonitoring(client)
  clientPromise = client.connect()
}

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await client.close()
    console.log("MongoDB client connection closed through app termination")
  } catch (error) {
    console.error("Error closing MongoDB client:", error)
  }
  process.exit(0)
})

// Health check function
export async function checkMongoClientHealth() {
  try {
    const client = await clientPromise
    const adminDb = client.db().admin()
    const result = await adminDb.ping()

    return {
      status: "healthy",
      ping: result,
      serverStatus: await adminDb.serverStatus(),
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get connection pool statistics
export async function getPoolStats() {
  try {
    const client = await clientPromise
    const db = client.db()
    const stats = await db.stats()

    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      storageSize: stats.storageSize,
    }
  } catch (error) {
    console.error("Error getting pool stats:", error)
    return null
  }
}

export default clientPromise
