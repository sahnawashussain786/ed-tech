import mongoose from 'mongoose'

let cached = globalThis.__learnhubMongo
if (!cached) cached = globalThis.__learnhubMongo = { conn: null, promise: null }

/**
 * Connect to MongoDB. Caches the connection so serverless invocations reuse it.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set — add it to your environment or .env file')

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    mongoose.set('strictQuery', true)
    cached.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10_000 })
      .then((m) => m)
      .catch((err) => {
        cached.promise = null
        throw err
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
