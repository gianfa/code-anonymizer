FROM ghcr.io/gitleaks/gitleaks:v8.29.0 AS gitleaks
FROM ghcr.io/google/osv-scanner:v2.3.2 AS osv

FROM node:20-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    bash \
    openssh-client \
    tree \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml ./
COPY packages/core/package.json packages/core/package.json
COPY packages/vscode-ext/package.json packages/vscode-ext/package.json
COPY --from=gitleaks /usr/bin/gitleaks /usr/local/bin/gitleaks
COPY --from=osv /osv-scanner /usr/local/bin/osv-scanner

RUN pnpm install --frozen-lockfile=false

COPY . .

CMD ["bash"]