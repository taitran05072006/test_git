{{- define "product-api.name" -}}{{ .Chart.Name }}{{- end }}
{{- define "product-api.fullname" -}}{{ include "product-api.name" . }}{{- end }}
{{- define "product-api.labels" -}}
app.kubernetes.io/name: {{ include "product-api.name" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
