#!/usr/bin/env bash
helm upgrade --install product-api deploy/helm/product-api --namespace product --create-namespace --values deploy/helm/product-api/values-dev.yaml



# kubectl port-forward -n kube-system svc/traefik 8088:80