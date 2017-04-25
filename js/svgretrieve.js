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


/** Derive `SVGRect` instances based on relevant geometric properties of SVG DOM elements.
*/

"use strict";

var Svgretrieve = {
    highlight_unregistered: false,
    highlight_isc: false,
    highlighterFn: undefined,
    UNREGISTERED_COLOUR: "#ffbb22",
    svgroot: undefined,
    clip8root: undefined,
    I_collection: undefined,
    S_collection: undefined,
    C_collection: undefined,
    rect_intervals: undefined,
    init: function (svgroot, highlight_unregistered, highlight_isc, highlighterFn) {
        console.log("[Svgretrieve.init]", svgroot, highlight_unregistered, highlight_isc, highlighterFn)
        Svgretrieve.highlight_unregistered = highlight_unregistered;
        Svgretrieve.highlight_isc = highlight_isc;
        Svgretrieve.highlighterFn = highlighterFn;
        Svgretrieve.svgroot = svgroot;
        Svgretrieve.clip8root = svgroot.getElementById("clip8");
        if (! Svgretrieve.clip8root) Svgretrieve.clip8root = Svgretrieve.svgroot;
        Svgretrieve.registerElements_fromDOM();
    },


    // The current implementation has a redundancy in it:
    // First, elements are retrieved by tagName but `ISCD.detect` makes no use of that information but
    // classifies them generically, assuming any SVG element.
    // For testing and code legibility I decided to stick with it for now.
    registerElements_fromDOM () {
        Svgretrieve.I_collection = new kdTree([], Svgdom.euclidDistance, ["x", "y"]);
        Svgretrieve.S_collection = new kdTree([], Svgdom.euclidDistance, ["x", "y"]);
        Svgretrieve.C_collection = new kdTree([], Svgdom.euclidDistance, ["x", "y"]);
        var viewboxparams = Svgretrieve.svgroot.getAttribute("viewBox").split(" ");
        var vBx = viewboxparams[0];
        var vBy = viewboxparams[1];
        var vBw = viewboxparams[2];
        var vBh = viewboxparams[3];
        if (vBw > vBh) {
            // main direction horizontal -- x -- width
            Svgretrieve._getMainInterval = Svginterval.getXIntervalRectElement;
            Svgretrieve._getOrthoInterval = Svginterval.getYIntervalRectElement;
        } else {
            // main direction horizontal -- y -- height
            Svgretrieve._getMainInterval = Svginterval.getYIntervalRectElement;
            Svgretrieve._getOrthoInterval = Svginterval.getXIntervalRectElement;
        }
        var elems, cpts, cpt;

        console.groupCollapsed("Register SVG graphics elements.");
        // RECT
        Svgretrieve.rect_intervals = new IntervalTree1D([]);         // init interval tree for data rectangles
        var elems = Svgretrieve.clip8root.getElementsByTagName("rect");
        var unreg = [];
        for (var i=0; i<elems.length; i++) {
            if ( ! Svgretrieve.registerRectElement(elems[i]) )
                unreg.push(elems[i]);
        }
        console.debug("[registerElements_fromDOM ] tree, elems:",
                                 Svgretrieve.rect_intervals, elems);
        // CIRCLE
        elems = Svgretrieve.clip8root.getElementsByTagName("circle");
        for (var i=0; i<elems.length; i++) {
            if (ISCD.detect(elems[i]) == ISCD.CONTROLFLOW) {
                cpt = Svgdom.getCentrePoint(elems[i]);
                cpt.ownerelement = elems[i];
                Svgretrieve.C_collection.insert(cpt);
            } else
                unreg.push(elems[i]);
        }
        // PATH
        elems = Svgretrieve.clip8root.getElementsByTagName("path");
        for (var i=0; i<elems.length; i++) {
            try {
                cpts = Svgdom.getBothEndsOfPath(elems[i]);
            }
            catch (err) {
                unreg.push(elems[i]);
                continue
            }
            switch(ISCD.detect(elems[i])) {
                case ISCD.INSTRUCTION:
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.I_collection.insert(cpt) });
                    break;
                case ISCD.CONTROLFLOW:
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.C_collection.insert(cpt) });
                    break;
                default:
                    unreg.push(elems[i]);
            }
        }
        // LINE
        elems = Svgretrieve.clip8root.getElementsByTagName("line");
        for (var i=0; i<elems.length; i++) {
            switch(ISCD.detect(elems[i])) {
                case ISCD.INSTRUCTION:
                    cpts = Svgdom.getBothEndsOfLine(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.I_collection.insert(cpt) });
                    break;
                case ISCD.SELECTOR:
                    cpts = Svgdom.getBothEndsOfLine(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.S_collection.insert(cpt) });
                    break;
                case ISCD.CONTROLFLOW:
                    cpts = Svgdom.getBothEndsOfLine(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.C_collection.insert(cpt) });
                    break;
                default:
                    unreg.push(elems[i]);
            }
        }
        // POLYLINE
        elems = Svgretrieve.clip8root.getElementsByTagName("polyline");
        for (var i=0; i<elems.length; i++) {
            switch(ISCD.detect(elems[i])) {
                case ISCD.INSTRUCTION:
                    cpts = Svgdom.getPointsOfPoly(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.I_collection.insert(cpt) });
                    break;
                case ISCD.CONTROLFLOW:
                    cpts = Svgdom.getPointsOfPoly(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.C_collection.insert(cpt) });
                    break;
                default:
                    unreg.push(elems[i]);
            }
        }
        console.groupEnd();
        if (unreg.len > 0) console.warn("there were unregistered elements:", unreg);
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
                return true;
            case ISCD.SELECTOR:
                cpts = Svgdom.getCornersOfRectPoints(rect);
                cpts.forEach( function (cpt) {
                    cpt.ownerelement = rect;
                    Svgretrieve.S_collection.insert(cpt) });
                return true;
            case ISCD.DATA:
                itv = Svgretrieve._getMainInterval(rect);  // get interval
                itv.push(rect);                            // append pointer to rect element
                Svgretrieve.rect_intervals.insert(itv);
                return true;
            default:
                return false;
        }
    },

    unregisterRectElement: function(rect) {
        var itv = Svgretrieve._getMainInterval(rect);
        var candidates = [], tobedeleted;
        Svgretrieve.rect_intervals.queryPoint(itv[0],
            function(itv) { candidates.push(itv) } );
        tobedeleted = candidates.filter( function (can) {
            return can[2] === rect;
        })
        if (tobedeleted.length == 1 && Svgretrieve.rect_intervals.remove(tobedeleted[0]))
            //console.debug("unregistered rect element:", rect);
            return;
        else
            throw "[unregisterRectElement] failed to remove"+rect;
    },

    getEnclosedRectangles: function (queryrect) {
        var qi = Svgretrieve._getMainInterval(queryrect);
        var oiv = Svgretrieve._getOrthoInterval(queryrect);
        var candidates = Svgretrieve.getIntersectingRectangles(queryrect);
        return candidates.filter(
            function (can) {
                return Svginterval.checkIntervalEnclosure(oiv, Svgretrieve._getOrthoInterval(can)) &&
                       Svginterval.checkIntervalEnclosure(qi, Svgretrieve._getMainInterval(can));
            } );
    },

    getIntersectingRectangles: function (queryrect) {
        var qi = Svgretrieve._getMainInterval(queryrect);
        var oiv = Svgretrieve._getOrthoInterval(queryrect);
        var candidates = [];
        var result = [];
        Svgretrieve.rect_intervals.queryInterval(qi[0], qi[1],
            function(itv) { candidates.push(itv[2]) } );
        result = candidates.filter (
            function (can) { return Svginterval.checkIntervalIntersection(oiv, Svgretrieve._getOrthoInterval(can)) } );
        //console.debug("[getIntersectedRectangles] candidates", candidates, result);
        return result;
    },

    enclosingFullHeightStripe: function(line) {
        /*  Determine the horizontal boundaries enclosing `line`.
            Return a full-height vertical stripe/rectangle (from top to bottom of `Svgretrieve.svgroot`) with corresponding horizontal boundaries.
            Initial use case: Select elements potentially affected by a horizontal cut.
        */
        var p1, p2, above, below, stripe, x1, y1, x2, y2, vBy, vBh;
        x1 = line.x1.baseVal.value;
        y1 = line.y1.baseVal.value;
        x2 = line.x2.baseVal.value;
        y2 = line.y2.baseVal.value;
        vBy = Svgretrieve.svgroot.getAttribute("viewBox").split(" ")[1];
        vBh = Svgretrieve.svgroot.getAttribute("viewBox").split(" ")[3];

        p1 = Svgretrieve.svgroot.createSVGPoint();
        p2 = Svgretrieve.svgroot.createSVGPoint();
        p1.x = x1;
        p1.y = vBy;
        p2.x = x2;
        p2.y = vBy+vBh;
        stripe = Svgdom.newSVGRect_fromPoints(p1, p2);
        p1 = Svgretrieve.svgroot.createSVGPoint();
        p2 = Svgretrieve.svgroot.createSVGPoint();
        p1.x = x1;
        p1.y = y1;
        p2.x = x2;
        p2.y = vBy+vBh;
        above = Svgdom.newSVGRect_fromPoints(p1, p2);
        p1 = Svgretrieve.svgroot.createSVGPoint();
        p2 = Svgretrieve.svgroot.createSVGPoint();
        p1.x = x1;
        p1.y = y1;
        p2.x = x2;
        p2.y = vBy;
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

    detect: function(el) {
        if (ISCD.debug) console.log("[ISCD] element, tagName", el, el.tagName);
        var computedStyle = window.getComputedStyle(el);
        if (ISCD.debug) console.log("----computedStyle", computedStyle);
        // See `tree-of-graphics-elements.pdf` for an overview of graphics element detection.
        if (el.tagName === "circle" || el.tagName === "ellipse") {
            if (ISCD.verbose) console.log("    CONTROLFLOW");
            return ISCD.CONTROLFLOW;
        } else if ( computedStyle.getPropertyValue("stroke") != "none" &&
                    computedStyle.getPropertyValue("stroke-linecap") == "round" &&
                    computedStyle.getPropertyValue("stroke-linejoin") == "round" ) {
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
