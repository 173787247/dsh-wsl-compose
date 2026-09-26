# Changelog

## 0.1.1

- Richer `compose_status`: `docker compose version`, `allowRootsCount`, `allowMutate`.
- Confirm `compose_ps` / `compose_logs` remain the high-frequency read-only pair (logs tail capped at 500).

## 0.1.0

- `compose_status`, `compose_ps`, `compose_logs`; optional mutate `compose_up`/`compose_down` with confirm.
