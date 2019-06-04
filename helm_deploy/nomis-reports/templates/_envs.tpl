{{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: PORT
    value: "{{ .Values.image.port }}"

  - name: REPORT_API_URL
    value: "{{ .Values.env.REPORT_API_URL }}"

  - name: OAUTH_API_URL
    value: "{{ .Values.env.OAUTH_API_URL }}"

  - name: REPORT_USERNAME
    value: "{{ .Values.env.REPORT_USERNAME }}"

  - name: REPORT_PASSWORD
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: REPORT_PASSWORD

{{- end -}}
