use tezos_smart_rollup::{
    kernel_entry,
    prelude::{debug_msg, Runtime},
};

pub fn entry(rt: &mut impl Runtime) {
    debug_msg!(rt, "Hello TezDev 2023!!!\n");
}

kernel_entry!(entry);
