import mongoose from "mongoose"

// Connection pool configuration
const MONGODB_OPTIONS = {
  bufferCommands: false,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  minPoolSize: 2, // Maintain at least 2 connections in the pool
}

// Definir la interfaz para extender el objeto global
declare global {
  var _mongoose:
    | {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
      }
    | undefined
}

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global._mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, MONGODB_OPTIONS)
      .then((mongoose) => {
        console.log("MongoDB connected successfully with connection pooling")

        // Connection event listeners for monitoring
        mongoose.connection.on("connected", () => {
          console.log("MongoDB connection established")
        })

        mongoose.connection.on("error", (err) => {
          console.error("MongoDB connection error:", err)
        })

        mongoose.connection.on("disconnected", () => {
          console.log("MongoDB disconnected")
        })

        // Graceful shutdown
        process.on("SIGINT", async () => {
          await mongoose.connection.close()
          console.log("MongoDB connection closed through app termination")
          process.exit(0)
        })

        return mongoose
      })
      .catch((error) => {
        console.error("MongoDB connection failed:", error)
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    cached.promise = null
    throw error
  }
}

// Connection health check
export async function checkDbHealth() {
  try {
    const connection = await dbConnect()
    return {
      status: "healthy",
      readyState: connection.connection.readyState,
      host: connection.connection.host,
      name: connection.connection.name,
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get connection statistics
export function getConnectionStats() {
  if (cached.conn) {
    const connection = cached.conn.connection
    return {
      readyState: connection.readyState,
      host: connection.host,
      port: connection.port,
      name: connection.name,
      collections: Object.keys(connection.collections).length,
    }
  }
  return null
}

export default dbConnect
