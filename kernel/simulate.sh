#!/bin/sh

cargo build --release --target wasm32-unknown-unknown

octez-smart-rollup-wasm-debugger \
    --kernel target/wasm32-unknown-unknown/release/tezdev_2023.wasm \
    --inputs inputs.json