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

## Compatibility

| Field | Value |
|-------|-------|
| **Plugin** | `dsh-wsl-compose` **0.1.1** |
| **Minimum dsh** | ≥ **0.1.2** (web UI one-shot `?token=` on Windows relay `:3081`) |
| **Latest verified** | See [dsh-wsl-kit Compatibility](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) (currently **`0.2.0-rc.2`**) — single source of truth for the suite |
| **Kit set** | optional (not in `install.sh` / `KIT_SET=daily` by default) |

## License

MIT
