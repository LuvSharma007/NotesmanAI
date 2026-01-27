Improvements needed

1.) add Google Login (pending)
2.) add Middlewares (pending)
3.) implement web sockets for Real time update on frontend using (socket.io) (pending) 
4.) store one user files data in one qdrant collection (pending)
5.) add confirm message to delete file
6.) query Re-writing
7.) fetch messages from redis to save DB calls
8.) file above 4-5 mb not working , issue from cloudinary to qdrant
run worker - npx --yes --locally tsx src/bullmq/workers/upload.worker.ts



- load documents in stream not as a whole in memory at once
then save the data in queue as a micro batching and upsert in qdrant
- used convertAPI

When ready, setup a distributed system for production ----- from qdrant Docs


 
