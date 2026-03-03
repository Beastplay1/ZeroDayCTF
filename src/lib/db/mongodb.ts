type MongoAction =
  | "findOne"
  | "find"
  | "insertOne"
  | "updateOne";

const dataApiUrl = process.env.MONGODB_DATA_API_URL;
const apiKey = process.env.MONGODB_DATA_API_KEY;
const dataSource = process.env.MONGODB_DATA_SOURCE || "Cluster0";
const database = process.env.MONGODB_DB || "zerodayctf";

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "api-key": apiKey || "",
  };
}

export function isMongoDataApiConfigured(): boolean {
  return Boolean(dataApiUrl && apiKey);
}

async function callMongoApi<T>(action: MongoAction, body: Record<string, unknown>): Promise<T> {
  if (!dataApiUrl || !apiKey) {
    throw new Error("MongoDB Data API is not configured");
  }

  const response = await fetch(`${dataApiUrl.replace(/\/$/, "")}/action/${action}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      dataSource,
      database,
      ...body,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mongo Data API ${action} failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function mongoFindOne<T>(collection: string, filter: Record<string, unknown>) {
  const result = await callMongoApi<{ document: T | null }>("findOne", { collection, filter });
  return result.document;
}

export async function mongoFindMany<T>(
  collection: string,
  filter: Record<string, unknown>,
  sort?: Record<string, 1 | -1>,
  limit?: number,
) {
  const result = await callMongoApi<{ documents: T[] }>("find", {
    collection,
    filter,
    sort,
    limit,
  });
  return result.documents;
}

export async function mongoInsertOne<T>(collection: string, document: T) {
  return callMongoApi<{ insertedId: string }>("insertOne", { collection, document });
}

export async function mongoUpdateOne(
  collection: string,
  filter: Record<string, unknown>,
  update: Record<string, unknown>,
  upsert = false,
) {
  return callMongoApi<{ matchedCount: number; modifiedCount: number; upsertedId?: string }>("updateOne", {
    collection,
    filter,
    update,
    upsert,
  });
}
