#!/bin/bash
# usage: hitset.sh '<query>'
for s in 3 5 7; do for mv in "arming 1.35 left" "longsword 1.5 left" "longsword 1.5 chest" "axe 1.45 chest" "mace 1.2 chest"; do set -- $mv; echo -n "$s $mv: "; Q="$Q" NOSHOT=1 NOAUDIO=1 SEED=$s WEP=$1 DIST=$2 MOVE=$3 timeout 300 node hit287.mjs 2>&1 | grep -E "SUM|NO HIT|rror" | sed 's/"mode".*"tip4":[0-9.]*,//' | tr '\n' ' '; echo; done; done
