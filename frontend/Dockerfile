FROM nginx:latest
COPY  nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY ../dist /usr/share/nginx/html
COPY ../dist /app
CMD ["nginx", "-g", "daemon off;"]