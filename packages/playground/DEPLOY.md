# Environment

- node@16.15.1
- yarn@1.22.19

# Install

yarn

# Build

yarn build

# Custom Host Build

yarn build --base https://yourhost.com

# Deploy

set the 'dist' as the root directory in Nginx.

## Example

```
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;

        location / {
            root /Users/wing/Develop/lexical-markdown-showcase/dist;
            try_files $uri $uri/ /index.html;
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
            add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
        }
    }
}
```