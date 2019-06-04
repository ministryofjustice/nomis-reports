
### Example deploy command
```
helm --namespace nomis-reports-dev  --tiller-namespace nomis-reports-dev upgrade nomis-reports ./nomis-reports/ --install --values=values-dev.yaml --values=example-secrets.yaml
```

### Helm init

```
helm init --tiller-namespace nomis-reports-dev --service-account tiller --history-max 200
```

### Setup Lets Encrypt cert

```
kubectl -n nomis-reports-dev apply -f certificate-dev.yaml
```
