#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${1:-8000}"
DEFAULT_URL="http://127.0.0.1:${PORT}/"

get_default_interface() {
  route get default 2>/dev/null | awk '/interface: / {print $2; exit}'
}

get_local_ip() {
  local iface="${1:-}"
  if [ -z "$iface" ]; then
    return 0
  fi
  ipconfig getifaddr "$iface" 2>/dev/null || true
}

print_urls() {
  local phone_url="${1:-}"

  echo "このPCで開くURL: ${DEFAULT_URL}"
  if [ -n "$phone_url" ]; then
    echo "スマホで開くURL: ${phone_url}"
  else
    echo "スマホ用URLの取得に失敗しました。"
  fi
}

generate_qr() {
  local url="${1:-}"
  if [ -z "$url" ]; then
    return 0
  fi

  echo "ターミナルにQRコードを表示します。"

  if ! swift "${ROOT_DIR}/scripts/generate_qr.swift" "$url"; then
    echo "QRコードの生成に失敗しました。URLを直接開いてください。"
  fi
}

main() {
  local iface
  local ip_addr
  local phone_url=""

  iface="$(get_default_interface)"
  ip_addr="$(get_local_ip "$iface")"

  if [ -n "$ip_addr" ]; then
    phone_url="http://${ip_addr}:${PORT}/"
  fi

  print_urls "$phone_url"
  generate_qr "$phone_url"

  echo "サーバーを起動します..."
  cd "$ROOT_DIR"
  python3 -m http.server "$PORT" --bind 0.0.0.0
}

main "$@"
