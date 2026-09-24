# dsh-wsl-compose

> **语言：** **中文**（本页） · [English](./README.en.md)

docker compose：ps/logs；up/down 需双重确认。

| | |
|---|---|
| 版本 | **0.1.0** |
| 套件 | [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit) **可选**，不在 `install.sh` |

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-compose
# 或本机 path：
# dsh plugin --profile web add /mnt/c/Users/YOU/Desktop/AIFullStackDevelopment/dsh-wsl-compose
```

kit 批量链接（可选）：`bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## 工具

| 工具 | 作用 |
|------|------|
| `compose_status` | docker 是否可用 |
| `compose_ps` | compose ps |
| `compose_logs` | 日志尾 |
| `compose_up` | up -d（危险） |
| `compose_down` | down（危险） |

## 配置要点

`allowRoots / allowMutate / timeoutMs`

默认 `allowMutate: false`。变更必须 `allowMutate=true` 且工具参数 `confirm=true`。互补 `docker_doctor`。

## 兼容性

| 字段 | 值 |
|------|----|
| **插件** | `dsh-wsl-compose` **0.1.0** |
| **最低 dsh** | ≥ **0.1.2**（Web UI 一次性 `?token=`，Windows 中继 `:3081`） |
| **最新验证** | 以 [dsh-wsl-kit 兼容性](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) 为准（当前 **`0.1.7-alpha.2`**）— 套件唯一真源 |
| **套件档位** | 可选（默认不在 `install.sh` / `KIT_SET=daily`） |

## License

MIT
