FROM node:22.13.1-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --quiet

COPY . .

RUN npm run build --configuration=production

FROM nginx:stable-alpine3.20

COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist/mind-log-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
