start worker 
npx tsx --env-file=.env src/bullmq/workers/upload.worker.ts

delete all unused docker data
- sudo docker system prune