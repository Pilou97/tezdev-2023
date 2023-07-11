#!/bin/sh

cargo build --release --target wasm32-unknown-unknown

wasm-strip target/wasm32-unknown-unknown/release/tezdev_2023.wasm

RESULT=$(octez-dac-client send payload \
    to coordinator https://dac-coordinator.gcp.marigold.dev \
    from file target/wasm32-unknown-unknown/release/tezdev_2023.wasm \
    --wait-for-threshold 2)

echo $RESULT

CERTIFICATE=$(echo $RESULT | awk '{print $3}')

echo "submit upgrade?"; read

octez-client send smart rollup message \
    "hex:[\"00$CERTIFICATE\"]" from bob