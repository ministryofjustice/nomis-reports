FROM node:10.15.3
MAINTAINER HMPPS Digital Studio <info@digital.justice.gov.uk>
ARG BUILD_NUMBER
ARG GIT_REF
ENV BUILD_NUMBER ${BUILD_NUMBER:-1_0_0}
ENV GIT_REF ${GIT_REF:-dummy}
ENV OAUTH_API_URL ${OAUTH_API_URL:-http://localhost:9090/auth/oauth}
ENV REPORT_API_URL ${REPORT_API_URL:-http://localhost:8080/custodyapi/api}
ENV REPORT_GRANT_TYPE ${REPORT_GRANT_TYPE:-client_credentials}
ENV REPORT_USERNAME ${REPORT_USERNAME:-nomis-reports}
ENV REPORT_PASSWORD ${REPORT_PASSWORD:-clientsecret}


RUN apt-get update && \
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

ENV PORT=3000
EXPOSE 3000

RUN chown -R appuser:appgroup /app

USER 2000

CMD [ "npm", "start" ]
