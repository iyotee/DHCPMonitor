#!/bin/bash
# Script de redirection vers scripts/start.sh
cd "$(dirname "$0")"
./scripts/start.sh "$@" 