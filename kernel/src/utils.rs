use tezos_data_encoding::{enc::BinWriter, nom::NomReader};
use tezos_smart_rollup::{host::RuntimeError, prelude::Runtime, storage::path::Path};

/// Read a data from the store.
#[allow(dead_code)]
pub fn store_read<Rt: Runtime, E: NomReader>(
    rt: &Rt,
    path: &impl Path,
) -> Result<Option<E>, RuntimeError> {
    if rt.store_has(path)?.is_some() {
        let bytes = rt.store_read_all(path)?;
        let (_, elt) = E::nom_read(&bytes).map_err(|_| RuntimeError::DecodingError)?;
        Ok(Some(elt))
    } else {
        Ok(None)
    }
}

/// Write an element in the durable storage under the given path.
#[allow(dead_code)]
pub fn store_write<Rt: Runtime, E: BinWriter>(
    rt: &mut Rt,
    path: &impl Path,
    e: E,
) -> Result<(), RuntimeError> {
    let mut bytes = Vec::default();
    e.bin_write(&mut bytes)
        .map_err(|_| RuntimeError::DecodingError)?;
    rt.store_write(path, &bytes, 0)
}

/// Read the next input
///
/// It will also try parse to the message
#[allow(dead_code)]
pub fn read_input<I: NomReader, Rt: Runtime>(rt: &mut Rt) -> Result<Option<I>, RuntimeError> {
    let input = rt.read_input()?;
    match input {
        None => Ok(None),
        Some(input) => match input.as_ref() {
            [0x01, remaining @ ..] => {
                let Ok((_, player_action)) = I::nom_read(remaining) else {return read_input(rt)};
                Ok(Some(player_action))
            }
            _ => read_input(rt),
        },
    }
}
