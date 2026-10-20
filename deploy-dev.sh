#!/usr/bin/env bash
helm upgrade --install product-api \
  deploy/helm/product-api \
  --namespace product \
  --create-namespace \
  --values deploy/helm/product-api/values-dev.yaml \
  --set images.backend.repository=product-api \
  --set images.backend.tag=dev \
  --set images.backend.pullPolicy=IfNotPresent \
  --set images.frontend.repository=product-frontend \
  --set images.frontend.tag=dev \
  --set images.frontend.pullPolicy=IfNotPresent \
  --wait \
  --timeout 10m