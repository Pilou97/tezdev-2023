#!/bin/sh

# Be careful, I am running this script with zsh as shell
# This script is using the octez-client available in your path
# And it will use its settings to connect to a tezos node
# This script make this assertion that you are connecting to a network with Protocall Alpha
# Also the octez-smart-rollup-node need a fix, provided by the branch pilou@dev in tezos (in one of the last commits)
# alias bob is required to originate and run the rollup

# Removing the old kernel
rm -rf rollup

# Just to make sure, nothing an old rollup node is not running
# I am not confident with my bash skilled.

# Building the kernel
echo Building the kernel.
cargo build --release --target wasm32-unknown-unknown

# Splitting the kernel
mkdir -p rollup
cp target/wasm32-unknown-unknown/release/tezdev_2023.wasm ./rollup/kernel.wasm
wasm-strip ./rollup/kernel.wasm
smart-rollup-installer get-reveal-installer --upgrade-to rollup/kernel.wasm --output rollup/installer.hex --preimages-dir rollup/wasm_2_0_0


# Originate the rollup with octez-client
KERNEL_INSTALLER=$(cat rollup/installer.hex)

SOR_ADDR=$(octez-client originate smart rollup my-rollup from bob \
  of kind wasm_2_0_0 \
  of type bytes \
  with kernel "${KERNEL_INSTALLER}" \
  --burn-cap 999 --force | grep "Address:" | awk '{print $2}')

# Start the rollup node in background
echo TODO: Start the rollup node in background
octez-smart-rollup-node-PtNairob run operator for my-rollup with operators bob --log-kernel-debug --data-dir rollup 1>/dev/null 2>/dev/null &
PID=$?

# Display the log of rollup/kernel.log
trap 'true' SIGINT # To not quit the script when using CTRL-C
clear
touch rollup/kernel.log
tail -f rollup/kernel.log
echo

# When pressing CTRL-C, kill everything
kill -9 $PID
echo Rollup Node Stopped

