#!/usr/bin/env bash
# emu — start/stop the Rahal Android emulator without ceremony.
#
#   emu up        boot the AVD (background), wait until ready, wire adb reverse
#                 ports for Metro (8081) + backend (7145)
#   emu down      shut the emulator down cleanly
#   emu restart   down, then up
#   emu status    show whether an emulator is attached
#
# Assumes Android SDK tools are on PATH (they are, via ~/.bashrc). Override the
# AVD with:  AVD=SomeOtherAvd emu up
set -euo pipefail

AVD="${AVD:-Pixel_10}"

_serial() { adb devices | awk '/emulator-.*device$/{print $1; exit}'; }

emu_up() {
  if [ -n "$(_serial)" ]; then
    echo "emu: already running ($(_serial))"
  else
    echo "emu: booting $AVD ..."
    # -no-snapshot-load = clean boot; drop it for faster (snapshot) starts.
    nohup emulator -avd "$AVD" -no-snapshot-load >/tmp/emulator.log 2>&1 &
    adb wait-for-device
    # wait for full boot (sys.boot_completed=1)
    echo -n "emu: waiting for boot"
    until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
      echo -n "."; sleep 2
    done
    echo " ready"
  fi
  # Make the dev-client reach Metro + the backend over the emulator loopback.
  adb reverse tcp:8081 tcp:8081 >/dev/null
  adb reverse tcp:7145 tcp:7145 >/dev/null
  echo "emu: adb reverse set (8081 metro, 7145 backend)"
}

emu_down() {
  local s; s="$(_serial)"
  if [ -z "$s" ]; then echo "emu: nothing running"; return 0; fi
  echo "emu: shutting down $s ..."
  adb -s "$s" emu kill >/dev/null 2>&1 || true
  echo "emu: done"
}

case "${1:-}" in
  up)      emu_up ;;
  down)    emu_down ;;
  restart) emu_down; sleep 3; emu_up ;;
  status)  s="$(_serial)"; [ -n "$s" ] && echo "emu: running ($s)" || echo "emu: not running" ;;
  *) echo "usage: emu {up|down|restart|status}"; exit 1 ;;
esac
