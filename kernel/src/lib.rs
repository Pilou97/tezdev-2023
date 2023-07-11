use tezos_smart_rollup::{kernel_entry, prelude::Runtime};

pub fn entry(rt: &mut impl Runtime) {}

kernel_entry!(entry);
