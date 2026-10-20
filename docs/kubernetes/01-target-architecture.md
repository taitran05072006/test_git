# Kiến trúc đích

## Thành phần

`deploy/helm/product-api` là triển khai chính. Frontend phục vụ SPA và proxy `/api/`
đến Service `backend`; backend đọc cấu hình từ ConfigMap và credentials từ Secret.
Ingress chỉ bật ở staging/production values. Namespace, ServiceAccount không tự động
mount token, PDB, resource requests/limits, NetworkPolicy và HPA (có điều kiện) được
định nghĩa trong chart.

```text
HTTPS/DNS -> Ingress -> frontend Service -> frontend Pods
                              | /api
                              v
                         backend Service -> backend Pods -> external MySQL
```

## Luồng build/deploy

CI chạy test, build image đa kiến trúc, scan image và phát hành tag SHA. CD render Helm
với values môi trường và `helm upgrade --install --atomic`; rollback dùng
`helm rollback`. Không dùng `latest` làm tag phát hành production.

## Database và tác vụ nền

Staging/production dùng MySQL external/managed là mặc định để giảm rủi ro vận hành cho
một người. Dev/lab bật MySQL nội bộ chart để test end-to-end mà không phụ thuộc Docker
host gateway; dữ liệu lab nằm trên PVC local-path và không có HA. Trước khi đổi database
thật cần backup, restore drill, migration plan và phê duyệt. Source hiện không có
worker/scheduled job được xác minh; không tạo Job/CronJob giả. Nếu bổ sung tác vụ, tách
worker hoặc CronJob và dùng lock/idempotency để không chạy trùng trên replicas.

## Giới hạn

Chart không tự tạo TLS certificate, DNS record, registry secret, managed database,
monitoring stack hoặc backup operator. Đây là các phụ thuộc hạ tầng cần xác minh và
chọn theo môi trường, chi phí và SLO.
