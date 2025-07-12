import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Increased timeout to 30 seconds
});

export const db = drizzle({ client: pool, schema });

// Test the connection on startup with retry mechanism
export async function testConnection() {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const client = await pool.connect();
      console.log('Database connection established successfully');
      client.release();
      return;
    } catch (error) {
      retryCount++;
      console.error(`Database connection attempt ${retryCount} failed:`, error);
      
      if (retryCount >= maxRetries) {
        console.error('Max retries reached. Database connection failed.');
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}