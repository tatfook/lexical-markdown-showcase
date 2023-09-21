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

# How to use
In production env, you can visit an iframe which src is [markdown editor](http://localhost:5173/md?is_dev=false&is_editable=true&editable_min_height=280)
> You may need to set the url to the same domain, port, subdomain
```yaml
query:
  is_dev: type is boolean, default is true, the tree view will not be displayed when you set it to false.
  is_editable: type is boolean, default is true, the toolbar will not be displayed when you set it to false, but will display automatically only when you edit it.
  editable_min_height: type is number, default is 150, to display the full toolbar menu, you need to increase the editable height.
```