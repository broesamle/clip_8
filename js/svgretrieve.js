/*
    clip_8 interpreter; iconic language for paper-inspired operations.
    Copyright (C) 2016, 2017  Martin Brösamle

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/** Detect, classify, register and retrieve (multiple) SVG elements based on their
    tag, style, location or other spatial properties.
*/

"use strict";

var Svgretrieve = {
    highlight_unregistered: false,
    highlight_isc: false,
    highlighterFn: undefined,
    UNREGISTERED_COLOUR: "#ffff88",
    INSCTRUCTION_COLOUR: "#ffffff",
    SELECTOR_COLOUR: "#4444FF",
    CONTROLFLOW_COLOUR: "#9BC9C7",
    DATA_COLOUR: "#000000",
    svgroot: undefined,
    clip8root: undefined,
    I_collection: undefined,
    S_collection: undefined,
    C_collection: undefined,
    data_reg_ptr: 0,            // pointers for data exchange with WASM module
    data_vec_ptr: 0,
    data_len_ptr: 0,
    data_capacity_ptr: 0,
    data_IdToElement: {},       // map numeric ids to dom elements and leaf pointers
    data_nextId: 101,

    /** Tests whether an element is in an IGNORE subtree.
        Traverses from `el` to `root` and checks whether the elements id contains "IGNORE"
    */
    _excluded: function(el) {
        var checking = el;
        while (checking !== Svgretrieve.svgroot) {
            if ( checking.id.indexOf("IGNORE") != -1 ||
                 ["defs", "marker"].indexOf(checking.tagName) != -1 ) {
                console.log("to be ignored:", el, "because of parent:", checking);
                return true;
            }
            checking = checking.parentNode;
        }
        return false;
    },

    init: function (svgroot, highlight_unregistered, highlight_isc, highlighterFn, initdoneCallback, waittime) {
        if (!waittime) waittime = 0;
        if (waittime > 2500) {
            throw "WASM init timeout in Svgretrieve.init.";
        }
        else {
            var retry_timer;
            console.log("Checking if WASM module is ready...");
            if (WASM_READY) {
                console.log("   READY.");
                Svgretrieve._init_postWASM(svgroot, highlight_unregistered, highlight_isc, highlighterFn);
                if (initdoneCallback != undefined) initdoneCallback();
            }
            else {
                console.log("   retry soon...");
                retry_timer = window.setTimeout(function() {
                    Svgretrieve.init(svgroot, highlight_unregistered, highlight_isc, highlighterFn, initdoneCallback, waittime+50);
                }, 50);
            }
        }
    },

    _init_postWASM: function (svgroot, highlight_unregistered, highlight_isc, highlighterFn) {
        console.log("[Svgretrieve] INIT", svgroot, highlight_unregistered, highlight_isc, highlighterFn);
        Svgretrieve.highlight_unregistered = highlight_unregistered;
        Svgretrieve.highlight_isc = highlight_isc;
        Svgretrieve.highlighterFn = highlighterFn;
        Svgretrieve.svgroot = svgroot;
        Svgretrieve.clip8root = svgroot.getElementById("clip8");
        if (! Svgretrieve.clip8root) Svgretrieve.clip8root = Svgretrieve.svgroot;
        var viewboxparams = Svgretrieve.svgroot.getAttribute("viewBox").split(" ");
        Svgretrieve.viewBoxX = viewboxparams[0];
        Svgretrieve.viewBoxY = viewboxparams[1];
        Svgretrieve.viewBoxW = viewboxparams[2];
        Svgretrieve.viewBoxH = viewboxparams[3];
        Svgretrieve.registerElements_fromDOM();
    },

    // The current implementation has a redundancy in it:
    // First, elements are retrieved by tagName but `ISCD.detect` makes no use of that information but
    // classifies them generically, assuming any SVG element.
    // For testing and code legibility I decided to stick with it for now.
    registerElements_fromDOM () {
        var debug = false;
        Svgretrieve.I_collection = new kdTree([], Svgdom.euclidDistance, ["x", "y"]);
        Svgretrieve.S_collection = new kdTree([], Svgdom.euclidDistance, ["x", "y"]);
        Svgretrieve.C_collection = new kdTree([], Svgdom.euclidDistance, ["x", "y"]);

        if (Svgretrieve.viewBoxW > Svgretrieve.viewBoxH) {
            // main direction horizontal -- x -- width
            Svgretrieve._getMainInterval = Svginterval.getXIntervalRectElement;
            Svgretrieve._getOrthoInterval = Svginterval.getYIntervalRectElement;
        } else {
            // main direction horizontal -- y -- height
            Svgretrieve._getMainInterval = Svginterval.getYIntervalRectElement;
            Svgretrieve._getOrthoInterval = Svginterval.getXIntervalRectElement;
        }
        var referenceEl = Svgdom.addRect(Svgretrieve.clip8root, 0, 0, 1, 1);
        var refTrafo = referenceEl.getCTM();
        if (debug) console.log("Reference Transformation:", refTrafo, referenceEl);
        Svgretrieve.clip8root.removeChild(referenceEl);
        var elems, cpts, cpt;

        console.groupCollapsed("Register SVG graphics elements.");
        // RECT
        // init pointers on WASM module side
        Svgretrieve.data_reg_ptr = Module._new_data_reg();
        Svgretrieve.data_len_ptr = Module._new_element_count();
        Svgretrieve.data_capacity_ptr = Module._new_element_count();
        Svgretrieve.data_vec_ptr = _new_vec(Svgretrieve.data_capacity_ptr, Svgretrieve.data_len_ptr);
        var elems = Svgretrieve.clip8root.getElementsByTagName("rect");
        var transformed = [];   // elements that could not registered due to a transformation
        var unreg = [];         // elements that were not registered for unspecific reasons
        for (var i=0; i<elems.length; i++) {
            if ( ! Svgretrieve.registerRectElement(elems[i]) )
                unreg.push(elems[i]);
        }

        // CIRCLE
        elems = Svgretrieve.clip8root.getElementsByTagName("circle");
        if (debug) console.debug("CIRCLE elements:", elems);
        for (var i=0; i<elems.length; i++) {
            if ( Svgretrieve._excluded(elems[i]) ) continue;
            if (ISCD.detect(elems[i]) == ISCD.CONTROLFLOW) {
                cpt = Svgdom.getCentrePoint(elems[i]);
                cpt.ownerelement = elems[i];
                if (debug) console.log("CTMs:", elems[i], elems[i].getCTM(), refTrafo);
                if (Svgdom.equalCTMs(elems[i].getCTM(), refTrafo)) {
                    Svgretrieve.C_collection.insert(cpt);
                }
                else {
                    if (debug) console.log("ignore transformed element", elems[i]);
                    transformed.push(elems[i]);
                }
                if (Svgretrieve.highlight_isc)
                    Svgretrieve.highlighterFn(elems[i], Svgretrieve.CONTROLFLOW_COLOUR);
            } else
                unreg.push(elems[i]);
        }
        // PATH
        elems = Svgretrieve.clip8root.getElementsByTagName("path");
        if (debug) console.debug("PATH elements:", elems);
        for (var i=0; i<elems.length; i++) {
            if ( Svgretrieve._excluded(elems[i]) ) continue;
            if (debug) console.log("CTMs:", elems[i], elems[i].getCTM(), refTrafo);
                if (!Svgdom.equalCTMs(elems[i].getCTM(), refTrafo)) {
                    if (debug) console.log("ignore transformed element", elems[i]);
                    transformed.push(elems[i]);
                    continue
                }
            try {
                cpts = Svgdom.getBothEndsOfPath(elems[i]);
            }
            catch (exc) {
                if (exc.source === "getBothEndsOfPath") {
                    unreg.push(elems[i]);
                    continue;
                }
                else
                    throw exc;
            }
            switch(ISCD.detect(elems[i])) {
                case ISCD.INSTRUCTION:
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.I_collection.insert(cpt) });
                if (Svgretrieve.highlight_isc)
                    Svgretrieve.highlighterFn(elems[i], Svgretrieve.INSTRUCTION_COLOUR);
                    break;
                case ISCD.CONTROLFLOW:
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.C_collection.insert(cpt) });
                    if (Svgretrieve.highlight_isc)
                        Svgretrieve.highlighterFn(elems[i], Svgretrieve.CONTROLFLOW_COLOUR);
                    break;
                default:
                    unreg.push(elems[i]);
            }
        }
        // LINE
        elems = Svgretrieve.clip8root.getElementsByTagName("line");
        if (debug) console.debug("LINE elements:", elems);
        for (var i=0; i<elems.length; i++) {
            if ( Svgretrieve._excluded(elems[i]) ) continue;
            if (debug) console.log("CTMs:", elems[i], elems[i].getCTM(), refTrafo);
                if (!Svgdom.equalCTMs(elems[i].getCTM(), refTrafo)) {
                    if (debug) console.log("ignore transformed element", elems[i]);
                    transformed.push(elems[i]);
                    continue
                }
            switch(ISCD.detect(elems[i])) {
                case ISCD.INSTRUCTION:
                    cpts = Svgdom.getBothEndsOfLine(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.I_collection.insert(cpt) });
                    if (Svgretrieve.highlight_isc)
                        Svgretrieve.highlighterFn(elems[i], Svgretrieve.INSCTRUCTION_COLOUR);
                    break;
                case ISCD.SELECTOR:
                    cpts = Svgdom.getBothEndsOfLine(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.S_collection.insert(cpt) });
                    if (Svgretrieve.highlight_isc)
                        Svgretrieve.highlighterFn(elems[i], Svgretrieve.SELECTOR_COLOUR);
                    break;
                case ISCD.CONTROLFLOW:
                    cpts = Svgdom.getBothEndsOfLine(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.C_collection.insert(cpt) });
                        if (Svgretrieve.highlight_isc)
                            Svgretrieve.highlighterFn(elems[i], Svgretrieve.CONTROLFLOW_COLOUR);
                    break;
                default:
                    unreg.push(elems[i]);
            }
        }
        // POLYLINE
        elems = Svgretrieve.clip8root.getElementsByTagName("polyline");
        if (debug) console.debug("POLYLINE elements:", elems);
        for (var i=0; i<elems.length; i++) {
            if ( Svgretrieve._excluded(elems[i]) ) continue;
            if (debug) console.log("CTMs:", elems[i], elems[i].getCTM(), refTrafo);
                if (!Svgdom.equalCTMs(elems[i].getCTM(), refTrafo)) {
                    if (debug) console.log("ignore transformed element", elems[i]);
                    transformed.push(elems[i]);
                    continue
                }
            switch(ISCD.detect(elems[i])) {
                case ISCD.INSTRUCTION:
                    cpts = Svgdom.getPointsOfPoly(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.I_collection.insert(cpt) });
                    if (Svgretrieve.highlight_isc)
                        Svgretrieve.highlighterFn(elems[i], Svgretrieve.INSTRUCTION_COLOUR);
                    break;
                case ISCD.CONTROLFLOW:
                    cpts = Svgdom.getPointsOfPoly(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.C_collection.insert(cpt) });
                        if (Svgretrieve.highlight_isc)
                            Svgretrieve.highlighterFn(elems[i], Svgretrieve.CONTROLFLOW_COLOUR);
                    break;
                default:
                    unreg.push(elems[i]);
            }
        }
        console.groupEnd();
        if (transformed.length > 0) {
            console.warn("there were transformed elements:", unreg);
            throw {
                source: "registerElements_fromDOM",
                error: "Found transformed elements.",
                transformed_elements: transformed,
                hint: Clip8.INTERNAL_ERROR_HINT };
        }
        if (unreg.length > 0) console.warn("there were unregistered elements:", unreg);
        if (Svgretrieve.highlight_unregistered)
            unreg.forEach(function (el) { Svgretrieve.highlighterFn(el, Svgretrieve.UNREGISTERED_COLOUR) } );
    },

    registerRectElement: function(rect) {
        var cpts, itv;
        switch(ISCD.detect(rect)) {
            case ISCD.INSTRUCTION:
                cpts = Svgdom.getCornersOfRectPoints(rect);
                cpts.forEach( function (cpt) {
                    cpt.ownerelement = rect;
                    Svgretrieve.I_collection.insert(cpt) });
                if (Svgretrieve.highlight_isc)
                    Svgretrieve.highlighterFn(rect, Svgretrieve.INSTRUCTION_COLOUR);
                return true;
            case ISCD.SELECTOR:
                cpts = Svgdom.getCornersOfRectPoints(rect);
                cpts.forEach( function (cpt) {
                    cpt.ownerelement = rect;
                    Svgretrieve.S_collection.insert(cpt) });
                if (Svgretrieve.highlight_isc)
                    Svgretrieve.highlighterFn(rect, Svgretrieve.SELECTOR_COLOUR);
                return true;
            case ISCD.DATA:
                var minsmaxs = Svgdom.getMinsAndMaxs_asArray(rect);
                Svgretrieve.data_IdToElement[Svgretrieve.data_nextId] = {
                    dom_element: rect,
                    leaf_ptr: Module._register_data_element(
                                              Svgretrieve.data_reg_ptr,
                                              Svgretrieve.data_nextId,
                                              minsmaxs[0],
                                              minsmaxs[1],
                                              minsmaxs[2],
                                              minsmaxs[3])};
                Svgretrieve.data_nextId += 1;
                // and I close my eyes and do not think about error handling for now!
                // FIXME: Find out how to check error conditions

                if (Svgretrieve.highlight_isc)
                    Svgretrieve.highlighterFn(rect, Svgretrieve.DATA_COLOUR);
                return true;
            default:
                return false;
        }
    },

    // filterFn and return value are numeric ids.
    // leaf_ptr or dom element have to be retrieved from Svgretrieve.data_IdToElement
    _getIntersectingDataElements: function(x, y, w, h, filterFn) {
        Svgretrieve.data_vec_ptr = Module._intersecting_data_elements(
                                              Svgretrieve.data_reg_ptr,
                                              x, y, x+w, y+h,
                                              Svgretrieve.data_vec_ptr,
                                              Svgretrieve.data_len_ptr,
                                              Svgretrieve.data_capacity_ptr);
        var len = getValue(Svgretrieve.data_len_ptr, 'i32');
        var capacity = getValue(Svgretrieve.data_capacity_ptr, 'i32');
        var result = [];
        // retrieve and filter returned elements
        for (var i = 0; i < len; i++) {
            var candidate_id = getValue(Svgretrieve.data_vec_ptr + i*Int32Array.BYTES_PER_ELEMENT, 'i32');
            if (filterFn(candidate_id))
                result.push(candidate_id);
        }
        return result;
    },

    unregisterRectElement: function(rect) {
        // FIXME: make a point-based query rather than using an epsilon-sized rect!
        var epsilon = 0.01;
        var minsmaxs = Svgdom.getMinsAndMaxs_asArray(rect);
        var tobedeleted = Svgretrieve._getIntersectingDataElements(
                                      minsmaxs[0], minsmaxs[1],
                                      epsilon, epsilon,
                                      function (id) {
                                          return Svgretrieve.data_IdToElement[id].dom_element === rect
                                      });
        if (tobedeleted.length == 1) {
            Module._ungregister_and_destroy_leaf(
                        Svgretrieve.data_reg_ptr,
                        Svgretrieve.data_IdToElement[tobedeleted[0]].leaf_ptr);
            delete Svgretrieve.data_IdToElement[tobedeleted[0]];
            console.debug("  --unregistered:", rect);
        }
        else {
            console.error("[unregisterRectElement] unexpected number of elements to be deleted:", tobedeleted);
            throw "[unregisterRectElement] unexpected number of elements to be deleted." + tobedeleted;
        }
    },

    getEnclosedRectangles: function (queryrect) {
        var qi = Svgretrieve._getMainInterval(queryrect);
        var oiv = Svgretrieve._getOrthoInterval(queryrect);
        var xywh = Svgdom.getXYWH_asArray(queryrect)
        var filterFn = function (can) {
            return Svginterval.checkIntervalEnclosure(oiv,
                        Svgretrieve._getOrthoInterval(Svgretrieve.data_IdToElement[can].dom_element))
                   &&
                   Svginterval.checkIntervalEnclosure(qi,
                        Svgretrieve._getMainInterval(Svgretrieve.data_IdToElement[can].dom_element));
            };
        var result_ids = Svgretrieve._getIntersectingDataElements(
                                xywh[0], xywh[1], xywh[2], xywh[3], filterFn);
        var result = [];
        for (var i = 0; i<result_ids.length; i++)
            result.push(Svgretrieve.data_IdToElement[result_ids[i]].dom_element);
        return result;
    },

    getIntersectingRectangles: function (queryrect) {
        var qi = Svgretrieve._getMainInterval(queryrect);
        var oiv = Svgretrieve._getOrthoInterval(queryrect);
        var xywh = Svgdom.getXYWH_asArray(queryrect)
        var filterFn = function (can) { return true };
        var result_ids = Svgretrieve._getIntersectingDataElements(
                                xywh[0], xywh[1], xywh[2], xywh[3], filterFn);
        var result = []
        for (var i = 0; i<result_ids.length; i++)
            result.push(Svgretrieve.data_IdToElement[result_ids[i]].dom_element);
        return result;
    },

    enclosingFullHeightStripe: function(line) {
        /*  Determine the horizontal boundaries enclosing `line`.
            Return a full-height vertical stripe/rectangle (from top to bottom of `Svgretrieve.svgroot`) with corresponding horizontal boundaries.
            Initial use case: Select elements potentially affected by a horizontal cut.
        */
        var p1, p2, above, below, stripe, x1, y1, x2, y2;
        x1 = line.x1.baseVal.value;
        y1 = line.y1.baseVal.value;
        x2 = line.x2.baseVal.value;
        y2 = line.y2.baseVal.value;

        p1 = Svgretrieve.svgroot.createSVGPoint();
        p2 = Svgretrieve.svgroot.createSVGPoint();
        p1.x = x1;
        p1.y = Svgretrieve.viewBoxY;
        p2.x = x2;
        p2.y = Svgretrieve.viewBoxY+Svgretrieve.viewBoxH;
        stripe = Svgdom.newSVGRect_fromPoints(p1, p2);
        p1 = Svgretrieve.svgroot.createSVGPoint();
        p2 = Svgretrieve.svgroot.createSVGPoint();
        p1.x = x1;
        p1.y = y1;
        p2.x = x2;
        p2.y = Svgretrieve.viewBoxY+Svgretrieve.viewBoxH;
        above = Svgdom.newSVGRect_fromPoints(p1, p2);
        p1 = Svgretrieve.svgroot.createSVGPoint();
        p2 = Svgretrieve.svgroot.createSVGPoint();
        p1.x = x1;
        p1.y = y1;
        p2.x = x2;
        p2.y = Svgretrieve.viewBoxY;
        below = Svgdom.newSVGRect_fromPoints(p1, p2);
        return [stripe, above, below];
    },

    enclosingFullWidthStripe: function(line) {
        /*  Determine the vertical boundaries enclosing `line`.
            Return a full-width horizontal stripe/rectangle (from left to right of `Svgretrieve.svgroot`) with corresponding vertical boundaries.
            Initial use case: Select elements potentially affected by a vertical cut.
        */
        throw "[enclosingFullWidthStripe] not implemented."
    },

    getISCbyLocation: function (point, radius, pointcandidates_count, tagnames, ISC_collection) {
        var result = [];
        if (ISC_collection.root != null) {   // check for empty collection
            var candidates = ISC_collection.nearest(point, pointcandidates_count, radius);
            for (var i=0; i < candidates.length; i++) {
                if (!tagnames || tagnames.indexOf(candidates[i][0].ownerelement.tagName) != -1)
                    result.push(candidates[i][0].ownerelement);
            }
        }
        return result
    },

    getLinesFromTo: function(p1, p2, tolerance, pointcandidates_count, ISC_collection) {
        /** Return all lines roughly connecting points `p1`, `p2`.
        */
        var debug = false;
        if (debug) console.log("[GETLINESFROMTO] p1, p2:", p1, p2);
        var candidates = Svgretrieve.getISCbyLocation(
                         p1,
                         tolerance,
                         pointcandidates_count,
                         ["line"],
                         ISC_collection);
        if (debug) console.log("[getLinesFromTo] candidates", candidates);
        return candidates.filter(
            function (can) {
                var endpoints = Svgdom.getBothEndsOfLine(can);
                return (Svgdom.euclidDistance(endpoints[0], p1) <= tolerance &&
                        Svgdom.euclidDistance(endpoints[1], p2) <= tolerance) ||
                        (Svgdom.euclidDistance(endpoints[1], p1) <= tolerance &&
                        Svgdom.euclidDistance(endpoints[0], p2) <= tolerance);
            });
    },
}

var ISCD = {
    debug       : false,
    verbose     : true,
    INVALID     : 0,
    INSTRUCTION : 1,
    SELECTOR    : 2,
    CONTROLFLOW : 3,
    DATA        : 4,

    _isDashed: function (style) {
        return style.getPropertyValue("stroke-dasharray") != "" && style.getPropertyValue("stroke-dasharray") != "none";
    },
    _isFilled: function (style) {
        return style.getPropertyValue("fill") != "" && style.getPropertyValue("fill") != "none";
    },
    _detectClosedElement: function (style) {
        if (ISCD._isDashed(style)) {
            if (ISCD.verbose) console.log("    SELECTOR (area)");
            return ISCD.SELECTOR;
        } else {
            if (ISCD._isFilled(style)) {
                if (ISCD.verbose) console.log("    DATA");
                return ISCD.DATA;
            } else {
                if (ISCD.verbose) console.log("    INVALID (no continuous stroke, no fill, no rounded edges)");
                return ISCD.INVALID;
            }
        }
    },

    /** Checks if a property is explicitly assigned to an element.
        The idea is to return exactly the visually effective properties; such as a visible stroke.
        If it is not set or `none` the return value is "".
    */
    getExplicitProperty: function (el, property) {
        var computedStyle = window.getComputedStyle(el);
        if (computedStyle.getPropertyValue(property) != "none")
            return computedStyle.getPropertyValue(property);
        else
            return "";
    },

    detect: function(el) {
        if (ISCD.verbose) console.log("[ISCD.detect]", el);
        var computedStyle = window.getComputedStyle(el);
        if (ISCD.debug) console.log("----computedStyle", computedStyle);
        // See `tree-of-graphics-elements.pdf` for an overview of graphics element detection.
        if (el.tagName === "circle" || el.tagName === "ellipse") {
            if (ISCD.verbose) console.log("    CONTROLFLOW");
            return ISCD.CONTROLFLOW;
        } else if ( computedStyle.getPropertyValue("stroke") != "none" &&
                    computedStyle.getPropertyValue("stroke-linecap") == "round" ) {
            if (ISCD.verbose) console.log("    INSTRUCTION");
            return ISCD.INSTRUCTION;
        } else if (el.tagName === "line") {
            if (ISCD._isDashed(computedStyle)) {
                // dashed line
                if (ISCD.verbose) console.log("    SELECTOR (connector/parameter line)");
                return ISCD.SELECTOR;
            } else {
                // continuous line
                if (ISCD.verbose) console.log("    INVALID (cont. line)");
                return ISCD.INVALID;
            }
        } else if (el.tagName === "polyline") {
        // FIXME: cf. #94, detect polyline and polygon elements.
        // FIXME: cf. #94, detect rect-shaped paths.
            if (ISCD.verbose) console.log("    CONTROLFLOW (alternative/join)");
            return ISCD.CONTROLFLOW;
        } else if (el.tagName === "path") {
            if (Svgdom.isClosedPath(el)) {
                // closed path
                return ISCD._detectClosedElement(computedStyle);
            } else {
                // open path
                if (Svgdom.isCurvedPath(el)) {
                    if (ISCD.verbose) console.log("    CONTROLFLOW (path)");
                    return ISCD.CONTROLFLOW;
                } else {
                // FIXME: cf. #94, detect straight-segmented paths like (poly)line.
                    throw "not implemented! " + "FIXME: cf. #94, detect straight-segmented paths like (poly)line.";
                }
            }
        } else if ( el.tagName === "rect" || el.tagName === "polygon" ) {
            return ISCD._detectClosedElement(computedStyle);
        } else {
            if (ISCD.verbose) console.log("    INVALID");
            return ISCD.INVALID;
        }
    },

    whichISCD_rect: function(rectelement) {
        return ISCD.INVALID
    },

    legibleStr(iscdvalue) {
        switch(iscdvalue) {
            case ISCD.INVALID     : return "INVALID";
            case ISCD.INSTRUCTION : return "INSTRUCTION";
            case ISCD.SELECTOR    : return "SELECTOR";
            case ISCD.CONTROLFLOW : return "CONTROLFLOW";
            case ISCD.DATA        : return "DATA";
            default:
                throw "[ISCD.legibleStr] Invalid ISC value" + iscdvalue;
        }
    }
}
