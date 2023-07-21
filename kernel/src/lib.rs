use tezos_data_encoding::{enc::BinWriter, nom::NomReader};
use tezos_smart_rollup::{
    dac::certificate::Certificate,
    inbox::InboxMessage,
    kernel_entry,
    michelson::MichelsonUnit,
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

#[derive(Debug, NomReader)]
enum Message {
    UpgradeRequest(Certificate),
}

fn read_message(rt: &mut impl Runtime) -> Option<Message> {
    let input = rt.read_input().ok()??;
    let _ = rt.mark_for_reboot();

    let (_, message) = InboxMessage::<MichelsonUnit>::parse(input.as_ref()).ok()?;
    debug_msg!(rt, "{message:?}\n");

    let InboxMessage::External(payload) = message else { return None };

    let (_, message) = Message::nom_read(payload).ok()?;

    Some(message)
}

pub fn entry(rt: &mut impl Runtime) {
    debug_msg!(rt, "Hello TezDev 2023!!!\n");

    let player = load_player(rt);
    let player = player.unwrap_or_default();

    if let Some(message) = read_message(rt) {
        debug_msg!(rt, "message: {message:?}\n");
        match message {
            Message::UpgradeRequest(_cert) => {
                // todo
            }
        };
    };

    save_player(rt, player);
}

kernel_entry!(entry);
