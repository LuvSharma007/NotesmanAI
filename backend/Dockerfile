# build

FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./

FROM base As development

RUN npm install
CMD [ "npm","run dev" ]

FROM base AS builder
RUN npm install

COPY . .

RUN npm run build

# production

FROM node:22-alpine AS production
WORKDIR /app


COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/tsconfig.json .
RUN npm ci --omit=dev

EXPOSE 4000

CMD [ "node","dist/index.js" ]
