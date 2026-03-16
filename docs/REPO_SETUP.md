# Repository Setup

Configuration required to make CI/CD work end-to-end.
Set everything under **Settings → Secrets and variables → Actions**.

---

## GitHub Secrets

> Secrets are encrypted. Never put real values in code or commit messages.

| Secret | Description | How to generate |
|---|---|---|
| `KUBECONFIG` | kubeconfig of the target cluster, **base64-encoded** | `base64 -w0 ~/.kube/config` |
| `VITE_API_URL` | Public URL of the backend API — baked into the JS bundle at build time | e.g. `https://api.inventory.example.com` |
| `GHCR_PAT` | Personal Access Token for the cluster to pull images from GHCR | [Create PAT](https://github.com/settings/tokens) with scope `read:packages` |

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

## Important: `VITE_API_URL` is a build-time variable

Vite bakes `VITE_API_URL` into the static JS bundle during `npm run build`.
This means the URL **must be known before building the Docker image**.

The CD workflow passes it as a Docker build arg:

```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

If the backend URL changes, a new image must be built and deployed.

---

## Kubernetes secrets applied by CD

The deploy job creates/updates these K8s resources automatically:

```bash
# Image pull secret  (namespace: inventory)
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<actor> \
  --docker-password="<GHCR_PAT>"
```

Run with `--dry-run=client -o yaml | kubectl apply -f -` — **idempotent**.

---

## Local development

```bash
cp .env.example .env   # set VITE_API_URL=http://localhost:8080
npm install
npm run dev            # starts on http://localhost:3000
```
