#[no_mangle]
pub extern fn register_data_element(key: i32,
                                    minx: i32,
                                    miny: i32,
                                    maxx: i32,
                                    maxy: i32) -> i32 {
    println!("ISCD register element: {} bounds: {}, {}, {}, {}", key, minx, miny, maxx, maxy);
    0x00
}

// needed for rustc to compile to wasm
fn main() {
    println!("ISCD rust-side main() was executed.");
}
