import { MongoClient, Db } from "mongodb";

type MongoAction = "findOne" | "find" | "insertOne" | "updateOne";

const dataApiUrl = process.env.MONGODB_DATA_API_URL;
const apiKey = process.env.MONGODB_DATA_API_KEY;
const dataSource = process.env.MONGODB_DATA_SOURCE || "Cluster0";
const databaseName = process.env.MONGODB_DB || "zerodayctf";
const mongodbUri = process.env.MONGODB_URI;

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "api-key": apiKey || "",
  };
}

export function isMongoDataApiConfigured(): boolean {
  return Boolean(dataApiUrl && apiKey);
}

export function isMongoNativeConfigured(): boolean {
  return Boolean(mongodbUri);
}

async function getNativeDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  if (!mongodbUri) throw new Error("MONGODB_URI is not configured");
  if (!cachedClient) {
    cachedClient = new MongoClient(mongodbUri, { maxPoolSize: 10 });
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db(databaseName);
  return cachedDb;
}

async function callMongoApi<T>(
  action: MongoAction,
  body: Record<string, unknown>,
): Promise<T> {
  if (!dataApiUrl || !apiKey) {
    throw new Error("MongoDB Data API is not configured");
  }

  const response = await fetch(
    `${dataApiUrl.replace(/\/$/, "")}/action/${action}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        dataSource,
        database: databaseName,
        ...body,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Mongo Data API ${action} failed: ${response.status} ${text}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function mongoFindOne<T>(
  collection: string,
  filter: Record<string, unknown>,
) {
  if (isMongoNativeConfigured()) {
    const db = await getNativeDb();
    return (await db.collection(collection).findOne(filter)) as T | null;
  }

  const result = await callMongoApi<{ document: T | null }>("findOne", {
    collection,
    filter,
  });
  return result.document;
}

export async function mongoFindMany<T>(
  collection: string,
  filter: Record<string, unknown>,
  sort?: Record<string, 1 | -1>,
  limit?: number,
) {
  if (isMongoNativeConfigured()) {
    const db = await getNativeDb();
    const cursor = db
      .collection(collection)
      .find(filter as any)
      .sort(sort as any);
    if (limit) cursor.limit(limit);
    return (await cursor.toArray()) as T[];
  }

  const result = await callMongoApi<{ documents: T[] }>("find", {
    collection,
    filter,
    sort,
    limit,
  });
  return result.documents;
}

export async function mongoInsertOne<T>(collection: string, document: T) {
  if (isMongoNativeConfigured()) {
    const db = await getNativeDb();
    const res = await db.collection(collection).insertOne(document as any);
    return { insertedId: res.insertedId.toString() } as { insertedId: string };
  }

  return callMongoApi<{ insertedId: string }>("insertOne", {
    collection,
    document,
  });
}

export async function mongoUpdateOne(
  collection: string,
  filter: Record<string, unknown>,
  update: Record<string, unknown>,
  upsert = false,
) {
  if (isMongoNativeConfigured()) {
    const db = await getNativeDb();
    const res = await db
      .collection(collection)
      .updateOne(filter as any, update as any, { upsert });
    return {
      matchedCount: res.matchedCount,
      modifiedCount: res.modifiedCount,
      upsertedId: res.upsertedId?.toString(),
    };
  }

  return callMongoApi<{
    matchedCount: number;
    modifiedCount: number;
    upsertedId?: string;
  }>("updateOne", {
    collection,
    filter,
    update,
    upsert,
  });
}

export async function mongoDeleteOne(
  collection: string,
  filter: Record<string, unknown>,
) {
  if (isMongoNativeConfigured()) {
    const db = await getNativeDb();
    const res = await db.collection(collection).deleteOne(filter as any);
    return { deletedCount: res.deletedCount };
  }
  // Data API doesn't support deleteOne — fallback not implemented
  throw new Error("mongoDeleteOne requires native MongoDB connection");
}

export async function mongoCount(
  collection: string,
  filter: Record<string, unknown>,
): Promise<number> {
  if (isMongoNativeConfigured()) {
    const db = await getNativeDb();
    return db.collection(collection).countDocuments(filter as any);
  }
  throw new Error("mongoCount requires native MongoDB connection");
}

export async function mongoAggregate<T>(
  collection: string,
  pipeline: Record<string, unknown>[],
): Promise<T[]> {
  if (isMongoNativeConfigured()) {
    const db = await getNativeDb();
    return (await db
      .collection(collection)
      .aggregate(pipeline)
      .toArray()) as T[];
  }
  throw new Error("mongoAggregate requires native MongoDB connection");
}
