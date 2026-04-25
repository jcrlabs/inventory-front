# Repository Setup

Configuration required to make CI/CD work end-to-end.
Set everything under **Settings → Secrets and variables → Actions**.

---

## GitHub Secrets

> Secrets are encrypted. Never put real values in code or commit messages.

| Secret | Description | How to generate |
|---|---|---|
| `KUBECONFIG` | kubeconfig of the target cluster, **base64-encoded** | `base64 -w0 ~/.kube/config` |
| `GHCR_PAT` | Personal Access Token for the cluster to pull images from GHCR | [Create PAT](https://github.com/settings/tokens) with scope `read:packages` |

> `VITE_API_URL` is **not** a secret — it is hardcoded in the workflow as `https://invent-back.jcrlabs.net`.
> If the backend hostname changes, update `env.VITE_API_URL` in `.github/workflows/cd.yml`.

---

## GitHub Variables

> Variables are not encrypted. Safe for non-sensitive config.

| Variable | Description | Example |
|---|---|---|
| *(none required for this repo)* | — | — |

---

## Environments

The CD workflow uses a GitHub Environment named **`production`**.

Go to **Settings → Environments → production** and optionally configure:
- **Required reviewers** — people who must approve each deployment
- **Wait timer** — delay before the deployment job starts
- **Deployment branches** — restrict to `main` or tag patterns (`v*`)

---

## Image registry

Images are pushed to **GitHub Container Registry (GHCR)**:

```
ghcr.io/jonathancaamano/inventory-front:<tag>
```

Authentication uses the automatic `GITHUB_TOKEN` (no extra secret needed to push).
The `GHCR_PAT` secret is only needed by the Kubernetes cluster to pull the image.

### Tag strategy

| Trigger | Tags applied |
|---|---|
| Push to `main` | `latest`, `sha-<short-sha>` |
| Push tag `v1.2.3` | `1.2.3`, `1.2`, `latest` |

---

## Kubernetes Ingress

The frontend is exposed via the cluster's nginx ingress controller:

| Domain | Service | Namespace |
|---|---|---|
| `electroteca.jcrlabs.net` | `inventory-front-service:80` | `taller-inventario` |

---

## Note: `VITE_API_URL` is a build-time variable

Vite bakes `VITE_API_URL` into the static JS bundle during `npm run build`.
The value is set directly in the workflow (`https://invent-back.jcrlabs.net`) and
passed as a Docker build arg — no GitHub secret required.

---

## Kubernetes secrets applied by CD

```bash
# Image pull secret  (namespace: taller-inventario)
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<actor> \
  --docker-password="<GHCR_PAT>" \
  --namespace=taller-inventario
```

Run with `--dry-run=client -o yaml | kubectl apply -f -` — **idempotent**.

---

## Local development

```bash
cp .env.example .env   # set VITE_API_URL=http://localhost:8080 for local dev
npm install
npm run dev            # starts on http://localhost:3000
```
