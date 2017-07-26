/// A small subset of the functionality of `ncollide` as a WASM module.
///
/// + Register axis aligned rectangular areas
///
/// + Query registered areas that intersect with
///   an axis aligned rectangular query area.
///
/// + Registered areas are identified via numeric `ElementId` and/or `Leaf` pointer.
///

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

/// Produces a pointer to the magic number.
///
/// # Safety
///
/// Produces a pointer to an i32.
/// Destroy it via `destroy_magic_number_ptr`.
///
#[no_mangle]
pub extern fn magic_number_ptr() -> *mut i32 {
    let magic_number: Box<i32> = Box::new(15432363);   // create i32
    Box::into_raw(magic_number)                        // forget i32
}

/// Destroys (consumes) a pointer to the magic number.
///
/// # Safety
///
/// Make sure pointer points to allocated memory for one i32.
///
#[no_mangle]
pub extern fn destroy_magic_number_ptr(ptr: *mut i32) {
    let _: Box<i32> = unsafe {
        assert!(!ptr.is_null());
        Box::from_raw(ptr)               // remember and destroy i32
    };
}

/// Produces a pointer to an empty `DataReg`.
///
/// # Safety
///
/// Produces a pointer to a `DataReg`.
/// Destroy it via `destroy_data_reg`.
///
#[no_mangle]
pub extern fn new_data_reg () -> *mut DataReg {
    let reg: Box<DataReg> = Box::new(DataReg::new());   // create reg
    Box::into_raw(reg)                                  // forget reg
}

#[no_mangle]
pub extern fn destroy_data_reg (reg_ptr: *mut DataReg) {
    let _: Box<DataReg> = unsafe {
        assert!(!reg_ptr.is_null());
        Box::from_raw(reg_ptr)            // remember and destroy reg
    };
}

/// Produces a pointer to an `ElementCount` (i.e. numbers of elements in `Vec`).
///
/// # Safety
///
/// Produces a pointer to an i32.
/// Destroy it via `destroy_element_count`.
///
#[no_mangle]
pub extern fn new_element_count () -> *mut ElementCount {
    let cnt: Box<ElementCount> = Box::new(0);           // create cnt
    Box::into_raw(cnt)                                  // forget cnt
}

#[no_mangle]
pub extern fn destroy_element_count (count_ptr: *mut ElementCount) {
    let _: Box<ElementCount> = unsafe {
        assert!(!count_ptr.is_null());
        Box::from_raw(count_ptr)          // remember and destroy cnt
    };
}


/// Produces a pointer to `Vec`; sets values for `len_ptr` and `capacity_ptr`.
///
/// # Safety
///
/// Produces a pointer to `Vec`.
/// `len_ptr` and `capacity_ptr` need to be valid pointers to `ElementCount`
/// i.e. have been produced via `new_element_count`.
///
#[no_mangle]
pub extern fn new_vec(len_ptr: *mut ElementCount,
                      capacity_ptr: *mut ElementCount)
                      -> *mut ElementId {
    let mut vec: Vec<ElementId> = Vec::new();                   // create vec
    let mut len = unsafe { Box::from_raw(len_ptr) };            // remember len
    let mut capacity = unsafe { Box::from_raw(capacity_ptr) };  // remember capacity
    *len = vec.len() as ElementCount;
    *capacity = vec.capacity() as ElementCount;
    Box::into_raw(len);                                         // forget len
    Box::into_raw(capacity);                                    // forget capacity
    let vec_ptr = vec.as_mut_ptr();
    mem::forget(vec);                                           // forget vec
    vec_ptr
}

/// Destroys and consumes a pointer to a `Vec`.
///
/// # Safety
///
/// Consumes a pointer to `Vec`.
///
/// `len_ptr` and `capacity_ptr`
///
///   + are not consumed
///
///   + need to be valid pointers to `ElementCount`
///     containing appropriate values corresponding to `vec_ptr`
///     as provided by `new_vec_ptr` or `intersecting_data_elements`.
///
#[no_mangle]
pub extern fn destroy_vec(vec_ptr: *mut ElementId,
                          len_ptr: *mut ElementCount,
                          capacity_ptr: *mut ElementCount) {
    let len = unsafe { Box::from_raw(len_ptr) };                // remember len
    let capacity = unsafe { Box::from_raw(capacity_ptr) };      // remember capacity
    let _: Vec<ElementId> = unsafe  {                           // remember vec
        Vec::from_raw_parts(
            vec_ptr,
            *len as usize,
            *capacity as usize)
    };                                                          // destroy vec
    Box::into_raw(len);                                         // forget len
    Box::into_raw(capacity);                                    // forget capacity
}


/// Register a numeric `ElementId` with its bounding box `minx, miny, maxx, maxy`.
///
/// # Safety
///
/// Produces a pointer to `Leaf`.
/// The caller must keep the returned pointer and ensure its
/// later destruction, i.e. via `ungregister_and_destroy_leaf`.
///
#[no_mangle]
pub extern fn register_data_element(reg_ptr: *mut DataReg,
                                    key: ElementId,
                                    minx: Scalar,
                                    miny: Scalar,
                                    maxx: Scalar,
                                    maxy: Scalar) -> *const RefCell<Leaf> {
    println!("ISCD register element: {} bounds: {}, {}, {}, {}", key, minx, miny, maxx, maxy);
    let mut reg: Box<DataReg> = unsafe { Box::from_raw(reg_ptr) };      // remember reg
    let mins = Point2::new(minx, miny);
    let maxs = Point2::new(maxx, maxy);
    let bbox: AABB2<Scalar> = AABB2::new(mins, maxs);
    let reftoleaf: Rc<RefCell<Leaf>>= (*reg).insert_new(key, bbox);     // creates a new leaf
    Box::into_raw(reg);                                                 // forget reg
    Rc::into_raw(reftoleaf)                                             // forget leaf
}

/// Unregister and destroy (consume) an element, a pointer to `Leaf`.
///
/// # Safety
///
/// Consumes a pointer to `Leaf`.
///
/// `reg_ptr` must be a pointer to the `DataReg`
/// which previously registered the element.
///
#[no_mangle]
pub extern fn ungregister_and_destroy_leaf(reg_ptr: *mut DataReg,
                                           leaf_ptr: *const RefCell<Leaf>) {
    let mut leaf: Rc<RefCell<Leaf>> =
                    unsafe { Rc::from_raw(leaf_ptr) };                  // remember leaf
    let mut reg: Box<DataReg> = unsafe { Box::from_raw(reg_ptr) };      // remember reg
    (*reg).remove(&mut leaf);                                           // remove leaf from reg
    Box::into_raw(reg);                                                 // forget reg
                                                                        // leaf gets destroyed
}

/// Returns all elements intersecting with a query area `minx, miny, maxx, maxy`.
///
/// Receives `vec_ptr` (technically a pointer to the buffer used by `Vec`)
/// reconstructs the `Vec` using the values in `len_ptr`, and `capacity_ptr`.
///
/// Returns a new `Vec` (technically a buffer) with the result elements.
///
/// Sets appropriate `ElementCount` values for `len_ptr`, and `capacity_ptr`.
///
/// # Safety
///
/// Consumes `vec_ptr` and produces a new pointer to `Vec` and returns it.
/// The returned pointer may point to a different location than `vec_ptr` does.
/// The caller must update `vec_ptr` with the return value!
///
/// `vec_ptr` needs to be valid pointer to `Vec`, i.e. produced by `new_vec`.
///
/// `len_ptr` and `capacity_ptr`
///
///   + need to be valid pointers to `ElementCount`
///
///   + are not consumed
///
/// i.e. as produced by `new_element_count`.
///
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
    let mut len = unsafe { Box::from_raw(len_ptr) };            // remember len
    let mut capacity = unsafe { Box::from_raw(capacity_ptr) };  // remember capacity
    let mut vec: Vec<ElementId> = unsafe  {                     // remember vec
        Vec::from_raw_parts(vec_ptr, *len as usize, *capacity as usize)
    };
    vec.truncate(0);
    // collect intersecting elements
    let reg: Box<DataReg> = unsafe { Box::from_raw(reg_ptr) };  // remember reg
    (*reg).visit(&mut DataCollector::new(&mut bbox, &mut vec));
    Box::into_raw(reg);                                         // forget reg
    *len = vec.len() as ElementCount;
    *capacity = vec.capacity() as ElementCount;
    Box::into_raw(len);                                         // forget len
    Box::into_raw(capacity);                                    // forget capacity
    let new_vec_ptr = vec.as_mut_ptr();
    mem::forget(vec);                                           // forget vec
    new_vec_ptr
}

// needed for rustc to compile to wasm
fn main() {
    println!("ISCD rust-side main() was executed.");
}
