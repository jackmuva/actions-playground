import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { User, user } from './schema';
import { eq } from 'drizzle-orm';

const db = drizzle(
  createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN ?? "",
  })
)

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database", error);
    throw error;
  }
}

export async function createUser(
  email: string,
) {

  try {
    return await db.insert(user).values({ email });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

