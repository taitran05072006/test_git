# Container hóa

## Local

```sh
docker build -t product-api:dev ./product-api
docker build -t product-frontend:dev ./front
docker compose up --build
curl -f http://localhost:8085/api/hello
```

Backend chạy non-root, dùng JRE Alpine ở runtime và graceful shutdown. Frontend build
đa giai đoạn, Nginx chạy non-root trên cổng 8080, có SPA fallback, `/healthz` và proxy `/api/`.
Không có secret trong Dockerfile hoặc build arguments.

## Release

Build với `product-api:${GIT_SHA}` và `product-frontend:${GIT_SHA}`. Push vào registry
được phép, scan image trước deploy và pin digest trong production nếu registry hỗ trợ.
Không dùng `latest` để rollback hoặc kiểm soát phiên bản.
