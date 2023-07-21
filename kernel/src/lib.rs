use tezos_data_encoding::{enc::BinWriter, nom::NomReader};
use tezos_smart_rollup::{
    kernel_entry,
    prelude::{debug_msg, Runtime},
    storage::path::RefPath,
};

#[derive(Default, NomReader, BinWriter)]
struct Player {
    x_position: i32,
    y_position: i32,
}

const PLAYER_PATH: RefPath = RefPath::assert_from(b"/player");

fn load_player(rt: &impl Runtime) -> Option<Player> {
    let bytes = rt.store_read_all(&PLAYER_PATH).ok()?;
    let (_, player) = Player::nom_read(&bytes).ok()?;
    Some(player)
}

fn save_player(rt: &mut impl Runtime, player: Player) {
    let mut bytes = Vec::default();
    let _ = player.bin_write(&mut bytes);
    let _ = rt.store_write_all(&PLAYER_PATH, &bytes);
}

pub fn entry(rt: &mut impl Runtime) {
    debug_msg!(rt, "Hello TezDev 2023!!!\n");

    let player = load_player(rt);
    let player = player.unwrap_or_default();

    save_player(rt, player);
}

kernel_entry!(entry);
