FROM node:23-alpine

WORKDIR /app

COPY .output/ ./.output/

EXPOSE 3000

USER node

CMD ["node", ".output/server/index.mjs"]