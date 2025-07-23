FROM node:23-alpine

WORKDIR /app

COPY .output/ ./.output/

RUN mkdir -p /app/uploads \
  && chown -R node:node /app/uploads \  
  && chmod 775 /app/uploads

EXPOSE 3000

USER node

CMD ["node", ".output/server/index.mjs"]