
### Example deploy command
```
helm --namespace nomis-reports-dev  --tiller-namespace nomis-reports-dev upgrade nomis-reports ./nomis-reports/ --install --values=values-dev.yaml --values=example-secrets.yaml
```

### Helm init

```
helm init --tiller-namespace nomis-reports-dev --service-account tiller --history-max 200
```

### Setup Lets Encrypt cert

Ensure the ceritificate defination exists in the cloud-platform-environments repo under the relavent namespaces folder

e.g.
```
cloud-platform-environments/namespaces/live-1.cloud-platform.service.justice.gov.uk/[INSERT NAMESPACE NAME]/05-certificate.yaml
```
