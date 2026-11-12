# product-api Helm chart

## Development deployment

The development values use an in-cluster MySQL instance and expect a Kubernetes
Secret named `product-api-database` in namespace `product`. Create it once before
the first Argo CD sync or Helm install; keep the generated values in a password
manager and do not commit them:

```sh
kubectl create namespace product --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret generic product-api-database -n product \
  --from-literal=username=product \
  --from-literal=password="$(openssl rand -base64 32)" \
  --from-literal=root-password="$(openssl rand -base64 32)"
```

The target cluster also needs a default StorageClass, a CNI that enforces
Kubernetes NetworkPolicies, CoreDNS matching the configured selector, the F5
NGINX Ingress Controller installed as release `nginx-ingress` in namespace
`nginx-ingress`, and Metrics Server for HPA metrics. The chart sets
`ingressClassName: nginx` and allows traffic from that controller's pod labels.
Install the controller with the official Helm chart:

```sh
helm install nginx-ingress oci://ghcr.io/nginx/charts/nginx-ingress \
  --namespace nginx-ingress --create-namespace --version 2.8.1
```

Configure `product.local` to resolve to the ingress controller's reachable
address to open the application in a browser. A local k3d cluster may also need
host port mappings for ports 80 and 443.

The chart can create the Secret itself by setting
`database.createSecret=true` and supplying `database.password` and
`database.rootPassword` through a secure deployment mechanism. Do not put these
values in a committed values file. The default keeps Secret management outside
Helm, which works with the included Argo CD application.

## Staging and production

`values-staging.yaml` and `values-production.yaml` deliberately require
environment-specific immutable image tags, database hosts/CIDRs, and DNS
selectors. They fail Helm rendering while those values are unset. Set them in a
protected environment-specific values source before deploying. Production
should use a managed database and TLS-enabled ingress with a real hostname and
pre-created TLS Secret.
