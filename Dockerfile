FROM node:10.15.3-slim
MAINTAINER HMPPS Digital Studio <info@digital.justice.gov.uk>
ARG BUILD_NUMBER
ARG GIT_REF
ENV BUILD_NUMBER ${BUILD_NUMBER:-1_0_0}
ENV GIT_REF ${GIT_REF:-dummy}

RUN apt-get update && \
    apt-get --assume-yes install git python python-dev make gcc && \
    addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000 && \
    mkdir -p /app

# Create app directory
WORKDIR /app
ADD . .

RUN npm install && \
    npm run build && \
    export BUILD_NUMBER=${BUILD_NUMBER} && \
    export GIT_REF=${GIT_REF} && \
    npm run record-build-info

ENV PORT=8080
EXPOSE 8080

RUN chown -R appuser:appgroup /app

USER 2000

CMD [ "npm", "start" ]
