"use strict";

describe("iscd.js, iscd.wasm", function () {
    beforeEach(function(done) {
        console.log("beforeEach, WASM_READY:", WASM_READY);
        var waitForWASM = function () {
            var retry_timer;
            console.log("[SPEC] checking if WASM module is ready.");
            if (WASM_READY) {
                console.log("    WASM READY.");
                done();
            }
            else {
                console.log("    RETRY...");
                retry_timer = window.setTimeout(waitForWASM, 50);
            }
        };
        waitForWASM();
    });
    describe("._magic_number()", function () {
        it("returns the magic number", function (done) {
            expect(Module._magic_number()).toBe(0xeb7aab);
            done();
        });
    });
    describe("magic number via heap and pointer", function () {
        var magic_number_ptr;
        describe("._magic_number_ptr()", function () {
            it("returns a pointer to the magic number", function (done) {
                magic_number_ptr = Module._magic_number_ptr();
                expect(typeof magic_number_ptr).toBe("number");
                var magic_number = getValue(magic_number_ptr, "i32");
                expect(magic_number).toBe(0xeb7aab);
                done();
            });
        });
        describe("._destroy_magic_number_ptr(ptr)", function () {
            it("frees the memory with the magic number", function (done) {
                expect(function () {
                    Module._destroy_magic_number_ptr(magic_number_ptr);
                }).not.toThrow();
                done();
            });
        });
    });
    describe("USE CASE: Register and query data elements", function () {
        var elementid = 143;
        var elementid2 = 144;
        var data_reg_ptr = 0;
        var vec_ptr = 0;
        var capacity_ptr = 0;
        var len_ptr = 0;
        var leaf_ptr = 0;
        var leaf2_ptr = 0;
        describe("Create WASM data structures:", function () {
            describe("._new_data_reg()", function () {
                it("creates a data element registry and returns a pointer to it.", function (done) {
                    data_reg_ptr = Module._new_data_reg();
                    expect(typeof(data_reg_ptr)).toBe("number");
                    done();
                });
            });
            describe("._new_element_count()", function () {
                it("allocates pointers to `ElementCount`.", function (done) {
                    len_ptr = Module._new_element_count();
                    capacity_ptr = Module._new_element_count();
                    expect(typeof(len_ptr)).toBe("number");
                    expect(typeof(capacity_ptr)).toBe("number");
                    expect(len_ptr).not.toBe(capacity_ptr);
                    done();
                });
            });
            describe("._new_vec(len_ptr, capacity_ptr)", function () {
                it("creates an empty `Vec`, updates `len_ptr` and `capacity_ptr`, returns a pointer.", function (done) {
                    vec_ptr = Module._new_vec(capacity_ptr, len_ptr);
                    expect(typeof(vec_ptr)).toBe("number");
                    var len = getValue(len_ptr, 'i32');
                    var capacity = getValue(capacity_ptr, 'i32');
                    expect(len).toBe(0);
                    expect(capacity).not.toBeLessThan(len);
                    done();
                });
            });
        });
        describe("Data Element Registry", function () {
            describe("._register_data_element(data_reg_ptr, elementid, 20, 40, 30, 50);", function () {
                it("registers an element with a bounding box; returns a pointer to the corresponding `leaf`.", function (done) {
                    leaf_ptr = Module._register_data_element(
                                              data_reg_ptr,
                                              elementid,
                                              20, 40, 30, 50);
                    expect(typeof(leaf_ptr)).toBe("number");
                    done();
                });
            });
            describe("._intersecting_data_elements(... , OUT vec_ptr, OUT capacity_ptr)", function () {
                it("should return one element for query area 21, 41, 32, 52.", function (done) {
                    vec_ptr = Module._intersecting_data_elements(
                                              data_reg_ptr,
                                              21, 41, 32, 52,
                                              vec_ptr,
                                              len_ptr,
                                              capacity_ptr);
                    var len = getValue(len_ptr, 'i32');
                    var capacity = getValue(capacity_ptr, 'i32');
                    expect(len).toBe(1);
                    expect(capacity).not.toBeLessThan(len);
                    expect(getValue(vec_ptr, 'i32')).toBe(elementid);
                    done();
                });
                it("should return no element for query area 121, 131, 122, 132.", function (done) {
                    vec_ptr = Module._intersecting_data_elements(
                                              data_reg_ptr,
                                              121, 131, 122, 132,
                                              vec_ptr,
                                              len_ptr,
                                              capacity_ptr);
                    var len = getValue(len_ptr, 'i32');
                    var capacity = getValue(capacity_ptr, 'i32');
                    expect(len).toBe(0);
                    expect(capacity).not.toBeLessThan(len);
                    done();
                });
            });
            describe("._ungregister_and_destroy_leaf(data_reg_ptr, leaf_ptr)", function () {
                it("removes a leaf from the registry and frees the allocated memory.", function (done) {
                    expect(function () {
                        Module._ungregister_and_destroy_leaf(data_reg_ptr, leaf_ptr);
                    }).not.toThrow();
                    done();
                });
            });
            describe("._intersecting_data_elements( ... )", function () {
                it("should no longer return an element for query area 21, 41, 32, 52,.", function (done) {
                    vec_ptr = Module._intersecting_data_elements(
                                              data_reg_ptr,
                                              21, 41, 32, 52,
                                              vec_ptr,
                                              len_ptr,
                                              capacity_ptr);
                    var len = getValue(len_ptr, 'i32');
                    var capacity = getValue(capacity_ptr, 'i32');
                    expect(len).toBe(0);
                    expect(capacity).not.toBeLessThan(len);
                    done();
                });
            });
        });
        describe("Data Registry with two Elements.", function () {
            describe("._register_data_element(data_reg_ptr, elementid, 20, 40, 30, 50);", function () {
                it("registers an element with a bounding box; returns a pointer to the corresponding `leaf`.", function (done) {
                    leaf_ptr = Module._register_data_element(
                                              data_reg_ptr,
                                              elementid,
                                              20, 40, 30, 50);
                    expect(typeof(leaf_ptr)).toBe("number");
                    done();
                });
            });
            describe("._register_data_element(data_reg_ptr, elementid2, 120, 140, 130, 150);", function () {
                it("registers an element with a bounding box; returns a pointer to the corresponding `leaf`.", function (done) {
                    leaf2_ptr = Module._register_data_element(
                                              data_reg_ptr,
                                              elementid2,
                                              120, 140, 130, 150);
                    expect(typeof(leaf2_ptr)).toBe("number");
                    expect(leaf2_ptr).not.toBe(leaf_ptr);
                    done();
                });
            });
            describe("._intersecting_data_elements(... , OUT vec_ptr, OUT capacity_ptr)", function () {
                it("should return one element for query area 21, 41, 32, 52.", function (done) {
                    vec_ptr = Module._intersecting_data_elements(
                                              data_reg_ptr,
                                              21, 41, 32, 52,
                                              vec_ptr,
                                              len_ptr,
                                              capacity_ptr);
                    var len = getValue(len_ptr, 'i32');
                    var capacity = getValue(capacity_ptr, 'i32');
                    expect(len).toBe(1);
                    expect(capacity).not.toBeLessThan(len);
                    expect(getValue(vec_ptr, 'i32')).toBe(elementid);
                    done();
                });
                it("should return one element for query area 121, 131, 132, 152.", function (done) {
                    vec_ptr = Module._intersecting_data_elements(
                                              data_reg_ptr,
                                              121, 131, 132, 152,
                                              vec_ptr,
                                              len_ptr,
                                              capacity_ptr);
                    var len = getValue(len_ptr, 'i32');
                    var capacity = getValue(capacity_ptr, 'i32');
                    expect(len).toBe(1);
                    expect(capacity).not.toBeLessThan(len);
                    expect(getValue(vec_ptr, 'i32')).toBe(elementid2);
                    done();
                });
                it("should return two elements for query area 21, 31, 132, 152.", function (done) {
                    vec_ptr = Module._intersecting_data_elements(
                                              data_reg_ptr,
                                              21, 31, 132, 152,
                                              vec_ptr,
                                              len_ptr,
                                              capacity_ptr);
                    var len = getValue(len_ptr, 'i32');
                    var capacity = getValue(capacity_ptr, 'i32');
                    expect(len).toBe(2);
                    expect(capacity).not.toBeLessThan(len);
                    // this criterion is too strict as it depends on the order of lements
                    expect(getValue(vec_ptr, 'i32')).toBe(elementid);
                    expect(getValue(vec_ptr+Int32Array.BYTES_PER_ELEMENT, 'i32')).toBe(elementid2);
                    done();
                });
            });
            describe("._ungregister_and_destroy_leaf(data_reg_ptr, leaf_ptr)", function () {
                it("removes a leaf from the registry and frees the allocated memory.", function (done) {
                    expect(function () {
                        Module._ungregister_and_destroy_leaf(data_reg_ptr, leaf_ptr);
                    }).not.toThrow();
                    done();
                });
            });
            describe("._ungregister_and_destroy_leaf(data_reg_ptr, leaf_ptr)", function () {
                it("removes a leaf from the registry and frees the allocated memory.", function (done) {
                    expect(function () {
                        Module._ungregister_and_destroy_leaf(data_reg_ptr, leaf2_ptr);
                    }).not.toThrow();
                    done();
                });
            });
            describe("._intersecting_data_elements( ... )", function () {
                it("should no longer return any element for query area 21, 31, 132, 152.", function (done) {
                    vec_ptr = Module._intersecting_data_elements(
                                              data_reg_ptr,
                                              21, 31, 132, 152,
                                              vec_ptr,
                                              len_ptr,
                                              capacity_ptr);
                    var len = getValue(len_ptr, 'i32');
                    var capacity = getValue(capacity_ptr, 'i32');
                    expect(len).toBe(0);
                    expect(capacity).not.toBeLessThan(len);
                    done();
                });
            });
        });
        describe("Destroy data structures (free allocated memory):", function () {
            describe("._destroy_data_reg(data_reg_ptr)", function () {
                it("destroys the registry (which must have been cleared to avoid memory leak).", function (done) {
                    expect(function () {
                        Module._destroy_data_reg(data_reg_ptr);
                    }).not.toThrow();
                    done();
                });
            });
            describe("._destroy_vec(vec_ptr, len_ptr, capacity_ptr)", function () {
                it("destroys a `Vec`; `len` and `capacity` as `ElementCount`.", function (done) {
                    expect(function () {
                        Module._destroy_vec(vec_ptr, len_ptr, capacity_ptr);
                    }).not.toThrow();
                    done();
                });
            });
            describe("._destroy_element_count(len_ptr)", function () {
                it("destroys the element count referred to by len_ptr.", function (done) {
                    expect(function () {
                        Module._destroy_element_count(len_ptr);
                    }).not.toThrow();
                    done();
                });
            });
            describe("._destroy_element_count(capacity_ptr)", function () {
                it("destroys the element count referred to by capacity_ptr.", function (done) {
                    expect(function () {
                        Module._destroy_element_count(capacity_ptr);
                    }).not.toThrow();
                    done();
                });
            });
        });
    });
});
