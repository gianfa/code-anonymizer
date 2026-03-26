FROM node:20-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    bash \
    openssh-client \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml ./
COPY packages/core/package.json packages/core/package.json
COPY packages/vscode-ext/package.json packages/vscode-ext/package.json

RUN pnpm install --frozen-lockfile=false

COPY . .

CMD ["bash"]