# Vận hành Kubernetes

## Khảo sát chỉ đọc

```sh
kubectl config current-context
kubectl version --short
kubectl get nodes
kubectl get storageclass
kubectl get ingressclass
kubectl get apiservice v1beta1.metrics.k8s.io
kubectl get networkpolicy --all-namespaces
```

Không chạy lệnh thay đổi cluster trong giai đoạn khảo sát.

## Mô hình database theo môi trường

`values-dev.yaml` chạy MySQL trong namespace `product`, có PVC `mysql-data` và Secret
do Helm tạo cho lab. Đây không phải HA hoặc backup production. Staging/production dùng
Secret `product-api-database` do platform/secret manager cung cấp và database external;
không bật `database.inCluster` nếu chưa có quy trình backup/restore.

## Render, deploy, rollback

```sh
helm lint deploy/helm/product-api
helm template product-api deploy/helm/product-api -f deploy/helm/product-api/values-staging.yaml
helm upgrade --install product-api deploy/helm/product-api \
  -n product --create-namespace -f deploy/helm/product-api/values-production.yaml \
  --set images.backend.repository="$BACKEND_IMAGE" \
  --set images.backend.tag="$GIT_SHA" \
  --set images.frontend.repository="$FRONTEND_IMAGE" \
  --set images.frontend.tag="$GIT_SHA" \
  --atomic --wait --timeout 10m
helm history product-api -n product
helm rollback product-api REVISION -n product --wait
```

## Kiểm tra và sự cố

```sh
kubectl get pods,svc,ingress -n product
kubectl describe pod -n product -l app=product-api-backend
kubectl logs -n product deploy/product-api-backend --all-containers --tail=100
kubectl rollout status deploy/product-api-backend -n product
```

## Kiểm tra cluster k3d hiện tại

`backend-service` phải trỏ tới cổng ứng dụng thật, không phải một Nginx placeholder:

```sh
kubectl -n default get svc backend-service -o yaml
kubectl -n default get endpoints backend-service
kubectl -n default get deploy backend-deployment -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
kubectl -n default run curl --rm -i --restart=Never --image=curlimages/curl \
  -- http://backend-service/
```

Nếu image vẫn là `nginx:*`, cluster chưa được triển khai backend của repository này.
Hãy build/push image rồi triển khai Helm chart; không sửa Service một cách tùy ý:

```sh
helm upgrade --install product-api deploy/helm/product-api \
  --namespace product --create-namespace \
  --values deploy/helm/product-api/values-dev.yaml \
  --set images.backend.repository="$BACKEND_IMAGE" \
  --set images.backend.tag="$GIT_SHA" \
  --set images.frontend.repository="$FRONTEND_IMAGE" \
  --set images.frontend.tag="$GIT_SHA" \
  --atomic --wait
```

Ingress hiện tại khai báo `api.local` trên Traefik. `curl http://127.0.0.1/` chỉ đúng
khi k3d đã publish cổng Traefik ra localhost. Nếu chưa publish, dùng port-forward:

```sh
kubectl -n kube-system port-forward svc/traefik 8088:80
curl -i -H 'Host: api.local' http://127.0.0.1:8088/
```

Alert tối thiểu nên theo dõi rollout failure, pod restart, readiness failure, CPU/memory
throttling, database connectivity, latency/error rate và dung lượng database. Backup
database phải được lưu ngoài cluster, mã hóa, có retention; restore drill cần thực hiện
định kỳ và ghi nhận thời gian RPO/RTO.
