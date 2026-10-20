# Khảo sát hiện trạng

## Đã xác minh từ repository

- Frontend là React 19 + Vite; `npm ci`, `npm run build` tạo static assets.
- Backend là Spring Boot 4.1.1, Java 17 trong Maven properties (Docker build hiện dùng
  JDK 21), chạy cổng 8080.
- API đã thấy: `GET /api/hello`, `GET /users/all`, `POST /users/create` và
  `GET /oauth/tiktok/callback`.
- Backend dùng MySQL qua `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
  Hiện Hibernate dùng `update`; production chart chuyển sang `validate` để tránh
  schema drift ngoài quy trình migration.
- Compose hiện có backend, MySQL và Nginx; volume MySQL là local Docker volume.
- CI hiện build/test backend, build/push hai image và deploy qua SSH + Tailscale.

## Chưa thể xác minh

Không có quyền truy cập cluster, registry, DNS, TLS, CNI, Metrics Server, database
production hay máy deploy từ repository này. Không coi các giá trị ví dụ trong Helm
là thông tin thật. Cần chạy các lệnh khảo sát trong `docs/kubernetes/operations.md`
với quyền được cấp trước khi triển khai.

## Rủi ro và việc phải làm trước production

1. Chưa có Flyway dependency/migration trong source; cần chọn Flyway hoặc quy trình
   schema riêng trước khi đặt `JPA_DDL_AUTO=validate`.
2. Database ngoài cluster là lựa chọn mặc định trong chart; phải tạo Secret từ
   secret manager, backup và kiểm thử restore trước khi release.
3. Cần xác minh Ingress controller, TLS issuer, DNS, CNI/NetworkPolicy và Metrics
   Server. HPA chỉ bật khi Metrics Server hoạt động.
4. TikTok callback và user endpoints chưa có authentication/authorization thể hiện
   trong source; không công khai các endpoint này nếu chưa bổ sung kiểm soát truy cập.

## Sơ đồ hiện tại

```text
Browser -> Nginx :8085 -> backend :8080 -> MySQL :3306
                         \-> /oauth/tiktok/callback
```

## Đề xuất

Dùng Helm với values theo môi trường, frontend/backend Deployment + Service, Ingress
do cluster cung cấp, database managed/external mặc định, Secret do platform quản lý,
NetworkPolicy/PDB/RBAC tối thiểu và image tag theo commit SHA. StatefulSet MySQL chỉ
phù hợp lab khi đã có backup/restore được kiểm thử; StatefulSet không tự tạo HA.
