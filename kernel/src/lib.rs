use tezos_crypto_rs::hash::PublicKeyBls;
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
    MoveUp,
    MoveDown,
    MoveLeft,
    MoveRight,
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

const PUBLIC_DAC_KEYS: [&str; 3] = [
    "BLpk1nHoWTSPMiG1W8qpimTSqrosAxc1L33Hyb9xHgXeVSZkzg26BxMunwajX2zekW8KuuT8Y4LP",
    "BLpk1nEyxfm3tzJ6Xx6S2UVgMonQ3KFBjKWEZ2TgJg89S7Mykb5dPsT8w7zeg1iUAVXgUqZqybX7",
    "BLpk1rNLTcT3Z6Y8ndq3Dw5XBiJSHuVsMSkn6nczbdt29WG3ksHRw14vy4KqwfMiedmmVYEYC2Nw",
];

const KERNEL_PATH: RefPath = RefPath::assert_from(b"/kernel/boot.wasm");

fn upgrade(rt: &mut impl Runtime, certificate: Certificate) {
    let pks = PUBLIC_DAC_KEYS
        .into_iter()
        .map(PublicKeyBls::from_base58_check)
        .collect::<Result<Vec<_>, _>>()
        .expect("Hardcoded committee PKs are valid");

    certificate
        .verify(&pks, 2)
        .expect("Signature verification to succeed.");

    certificate
        .reveal_to_store(rt, &KERNEL_PATH)
        .expect("Revealing certificate to succeed.");
}

pub fn entry(rt: &mut impl Runtime) {
    debug_msg!(rt, "Hello TezDev 2023!!!\n");

    let player = load_player(rt);
    let mut player = player.unwrap_or_default();

    if let Some(message) = read_message(rt) {
        debug_msg!(rt, "message: {message:?}\n");
        match message {
            Message::UpgradeRequest(cert) => upgrade(rt, cert),
            Message::MoveUp => player.y_position += 1,
            Message::MoveDown => player.y_position -= 1,
            Message::MoveLeft => player.x_position -= 1,
            Message::MoveRight => player.x_position += 1,
        };
    };

    save_player(rt, player);
}

kernel_entry!(entry);
