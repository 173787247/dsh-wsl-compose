# dsh-wsl-compose

> **Languages:** [中文（首页）](./README.md) · **English** (this file)

docker compose ps/logs; up/down double-gated.

| | |
|---|---|
| Version | **0.1.0** |
| Kit | Optional companion to [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit); not in `install.sh` |

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-compose
```

Batch link (optional): `bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## Tools

| Tool | Role |
|------|------|
| `compose_status` | docker on PATH |
| `compose_ps` | compose ps |
| `compose_logs` | log tail |
| `compose_up` | up -d (dangerous) |
| `compose_down` | down (dangerous) |

## Config

`allowRoots / allowMutate / timeoutMs`

Default `allowMutate: false`. Mutations need config + `confirm=true`. Complements `docker_doctor`.

## License

MIT
