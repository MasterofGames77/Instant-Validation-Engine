import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'market-pulse';

if (!uri) {
  console.warn('MONGODB_URI not found in environment variables. Using fallback connection.');
}

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (client && db) {
    return { client, db };
  }

  try {
    // If no URI is provided, return a mock connection for development
    if (!uri) {
      console.warn('No MongoDB URI provided. Running in offline mode.');
      return { client: null as unknown as MongoClient, db: null as unknown as Db };
    }

    // MongoDB connection options to handle SSL issues
    const options = {
      tls: true,
      tlsAllowInvalidCertificates: false, // Set to false for production
      tlsAllowInvalidHostnames: false,    // Set to false for production
      retryWrites: true,
      w: 'majority' as const,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 30000, // 30 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2,  // Maintain a minimum of 2 socket connections
      maxIdleTimeMS: 30000, // Close sockets after 30 seconds of inactivity
    };

    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db(dbName);
    
    console.log('Connected to MongoDB');
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Return mock connection instead of throwing to prevent app crashes
    console.warn('Falling back to offline mode due to MongoDB connection failure');
    return { client: null as unknown as MongoClient, db: null as unknown as Db };
  }
}

export async function closeConnection() {
  if (client) {
    await client.close();
  }
}
