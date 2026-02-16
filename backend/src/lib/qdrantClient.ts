import {QdrantClient} from '@qdrant/js-client-rest';

export const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey:process.env.QDRANT_API_KEY,
});

