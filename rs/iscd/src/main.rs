extern crate nalgebra;
extern crate ncollide;

use std::cell::RefCell;
use std::rc::Rc;
use std::mem;

use nalgebra::Point2;
use ncollide::bounding_volume::AABB2;
use ncollide::partitioning::{BoundingVolumeInterferencesCollector, DBVT, DBVTLeaf};

type ElementId = i32;
type ElementCount = i32;
type Scalar = f32;
type DataReg = DBVT<Point2<Scalar>, ElementId, AABB2<Scalar>>;
type Leaf = DBVTLeaf<Point2<Scalar>, ElementId, AABB2<Scalar>>;
type DataCollector<'a> = BoundingVolumeInterferencesCollector<'a, Point2<Scalar>, ElementId, AABB2<Scalar>>;

#[no_mangle]
pub extern fn magic_number() -> i32 {
    15432363
}

#[no_mangle]
pub extern fn magic_number_ptr() -> *mut i32 {
    let magic_number: Box<i32> = Box::new(15432363);
    Box::into_raw(magic_number)
}

#[no_mangle]
pub extern fn destroy_magic_number_ptr(ptr: *mut i32) {
    let _: Box<i32> = unsafe { Box::from_raw(ptr) };
}

#[no_mangle]
pub extern fn new_data_reg () -> *mut DataReg {
    let reg: Box<DataReg> = Box::new(DataReg::new());
    Box::into_raw(reg)                          // avoid destruction (Box)
}

#[no_mangle]
pub extern fn destroy_data_reg (reg_ptr: *mut DataReg) {
    let _: Box<DataReg> = unsafe {
        assert!(!reg_ptr.is_null());
        Box::from_raw(reg_ptr)                  // Box from JS pointer
    };
}

#[no_mangle]
pub extern fn new_element_count () -> *mut ElementCount {
    let reg: Box<ElementCount> = Box::new(0);
    Box::into_raw(reg)                          // avoid destruction (Box)
}

#[no_mangle]
pub extern fn destroy_element_count (count_ptr: *mut ElementCount) {
    let _: Box<ElementCount> = unsafe {
        assert!(!count_ptr.is_null());
        Box::from_raw(count_ptr)                  // Box from JS pointer
    };
}

#[no_mangle]
pub extern fn new_vec(len_ptr: *mut ElementCount,
                      capacity_ptr: *mut ElementCount)
                      -> *mut ElementId {
    let mut vec: Vec<ElementId> = Vec::new();
    let mut len = unsafe { Box::from_raw(len_ptr) };            // Box from JS pointer
    let mut capacity = unsafe { Box::from_raw(capacity_ptr) };  // Box from JS pointer
    *len = vec.len() as ElementCount;
    *capacity = vec.capacity() as ElementCount;
    Box::into_raw(len);                                         // avoid destruction (Box)
    Box::into_raw(capacity);                                    // avoid destruction (Box)
    let vec_ptr = vec.as_mut_ptr();
    mem::forget(vec);                           // avoid destruction (Vec)
    vec_ptr
}

#[no_mangle]
pub extern fn destroy_vec(vec_ptr: *mut ElementId,
                          len_ptr: *mut ElementCount,
                          capacity_ptr: *mut ElementCount)
                          -> ElementId {
    let len = unsafe { Box::from_raw(len_ptr) };            // Box from JS pointer
    let capacity = unsafe { Box::from_raw(capacity_ptr) };  // Box from JS pointer
    let mut vec: Vec<ElementId> = unsafe  {
        Vec::from_raw_parts(vec_ptr, *len as usize, *capacity as usize)
    };
    Box::into_raw(len);                                         // avoid destruction (Box)
    Box::into_raw(capacity);                                    // avoid destruction (Box)
    let value = match vec.pop() {
        Some(el) => el,
        None => 99,
    };
    value
}

#[no_mangle]
pub extern fn register_data_element(reg_ptr: *mut DataReg,
                                    key: ElementId,
                                    minx: Scalar,
                                    miny: Scalar,
                                    maxx: Scalar,
                                    maxy: Scalar) -> *const RefCell<Leaf> {
    println!("ISCD register element: {} bounds: {}, {}, {}, {}", key, minx, miny, maxx, maxy);
    let mut reg: Box<DataReg> = unsafe { Box::from_raw(reg_ptr) };          // Box from JS pointer
    let mins = Point2::new(minx, miny);
    let maxs = Point2::new(maxx, maxy);
    let bbox: AABB2<Scalar> = AABB2::new(mins, maxs);
    let reftoleaf: Rc<RefCell<Leaf>>= (*reg).insert_new(key, bbox);
    Box::into_raw(reg);                 // avoid destruction (Box)
    Rc::into_raw(reftoleaf)             // avoid destruction (Rc)
}

#[no_mangle]
pub extern fn ungregister_and_destroy_leaf(reg_ptr: *mut DataReg,
                                           leaf_ptr: *const RefCell<Leaf>) {
    let mut leaf: Rc<RefCell<Leaf>> = unsafe { Rc::from_raw(leaf_ptr) };    // Rc from JS pointer
    let mut reg: Box<DataReg> = unsafe { Box::from_raw(reg_ptr) };          // Box from JS pointer
    (*reg).remove(&mut leaf);
    Box::into_raw(reg);                                                     // avoid destruction (Box)
}

#[no_mangle]
pub extern fn intersecting_data_elements(reg_ptr: *mut DataReg,
                                         minx: Scalar,
                                         miny: Scalar,
                                         maxx: Scalar,
                                         maxy: Scalar,
                                         vec_ptr: *mut ElementId,
                                         len_ptr: *mut ElementCount,
                                         capacity_ptr: *mut ElementCount)
                                         -> *mut ElementId {
    // collector
    let mins = Point2::new(minx, miny);
    let maxs = Point2::new(maxx, maxy);
    let mut bbox: AABB2<Scalar> = AABB2::new(mins, maxs);
    let mut len = unsafe { Box::from_raw(len_ptr) };            // Box from JS pointer
    let mut capacity = unsafe { Box::from_raw(capacity_ptr) };  // Box from JS pointer
    let mut vec: Vec<ElementId> = unsafe  {     // Vec from JS pointer, len, capacity
        Vec::from_raw_parts(vec_ptr, *len as usize, *capacity as usize)
    };
    vec.truncate(0);
    // collect intersecting elements
    let reg: Box<DataReg> = unsafe { Box::from_raw(reg_ptr) };  // Box from JS pointer
    (*reg).visit(&mut DataCollector::new(&mut bbox, &mut vec));
    Box::into_raw(reg);                                         // avoid destruction (Box)
    *len = vec.len() as ElementCount;
    *capacity = vec.capacity() as ElementCount;
    Box::into_raw(len);                                         // avoid destruction (Box)
    Box::into_raw(capacity);                                    // avoid destruction (Box)
    let new_vec_ptr = vec.as_mut_ptr();
    mem::forget(vec);                           // avoid destruction (Vec)
    new_vec_ptr
}

// needed for rustc to compile to wasm
fn main() {
    println!("ISCD rust-side main() was executed.");
}
