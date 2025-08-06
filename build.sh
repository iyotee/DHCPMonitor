#!/bin/bash
# Script de redirection vers scripts/build.sh
cd "$(dirname "$0")"
./scripts/build.sh "$@" 