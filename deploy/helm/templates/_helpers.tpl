{{- define "inventory-front.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "inventory-front.fullname" -}}
{{- printf "%s" (include "inventory-front.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "inventory-front.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "inventory-front.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "inventory-front.selectorLabels" -}}
app.kubernetes.io/name: {{ include "inventory-front.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
