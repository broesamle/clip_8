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
    svgroot: undefined,
    clip8root: undefined,
    I_collection: undefined,
    S_collection: undefined,
    C_collection: undefined,
    rect_intervals: undefined,
    init: function (svgroot) {
        Svgretrieve.svgroot = svgroot;
        Svgretrieve.clip8root = svgroot.getElementById("clip8");
        if (! Svgretrieve.clip8root) Svgretrieve.clip8root = Svgretrieve.svgroot;
        Svgretrieve.registerElements_fromDOM();
    },

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
            console.debug("register circle element:", elems[i]);
            if (elems[i].getAttribute("stroke", "none") &&
                elems[i].getAttribute("stroke", "none") != "none") {
                console.debug("    CONTROL FLOW");
                cpt = Svgdom.getCentrePoint(elems[i]);
                cpt.ownerelement = elems[i];
                Svgretrieve.C_collection.insert(cpt);
            } else
                unreg.push(elems[i]);
        }
        // PATH
        elems = Svgretrieve.clip8root.getElementsByTagName("path");
        for (var i=0; i<elems.length; i++) {
            console.debug("register path element:", elems[i]);
            try {
                cpts = Svgdom.getBothEndsOfPath(elems[i]);
            }
            catch (err) {
                console.warn("could not register", elems[i]);
                continue
            }
            if (elems[i].getAttribute("stroke", "none") &&
                elems[i].getAttribute("stroke", "none") != "none" &&
                elems[i].getAttribute("stroke-linecap") == "round") {
                console.debug("   INSTRUCTION");
                cpts.forEach( function (cpt) {
                    cpt.ownerelement = elems[i];
                    Svgretrieve.I_collection.insert(cpt) });
            } else if (elems[i].getAttribute("stroke", "none") &&
                       elems[i].getAttribute("stroke", "none") != "none" &&
                       elems[i].getAttribute("stroke-linecap") != "round") {
                console.debug("   CONTROL FLOW");
                cpts.forEach( function (cpt) {
                    cpt.ownerelement = elems[i];
                    Svgretrieve.C_collection.insert(cpt) });
            } else
                unreg.push(elems[i]);
        }
        // LINE
        elems = Svgretrieve.clip8root.getElementsByTagName("line");
        for (var i=0; i<elems.length; i++) {
            console.debug("register line element:", elems[i]);
            if (elems[i].getAttribute("stroke", "none") &&
                elems[i].getAttribute("stroke", "none") != "none") {
                if (elems[i].getAttribute("stroke-linecap") == "round") {
                    console.debug("    INSTRUCTION");
                    cpts = Svgdom.getBothEndsOfLine(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.I_collection.insert(cpt) });
                } else {
                    if ( elems[i].getAttribute("stroke-dasharray") ) {
                        console.debug("    SELECTOR");
                        cpts = Svgdom.getBothEndsOfLine(elems[i]);
                        cpts.forEach( function (cpt) {
                            cpt.ownerelement = elems[i];
                            Svgretrieve.S_collection.insert(cpt) });
                    } else {
                        console.debug("    CONTROL FLOW");
                        cpts = Svgdom.getBothEndsOfLine(elems[i]);
                        cpts.forEach( function (cpt) {
                            cpt.ownerelement = elems[i];
                            Svgretrieve.C_collection.insert(cpt) });
                    }
                }
            } else
                unreg.push(elems[i]);
        }
        // POLYLINE
        elems = Svgretrieve.clip8root.getElementsByTagName("polyline");
        for (var i=0; i<elems.length; i++) {
            console.debug("register polyline element:", elems[i]);
            if (elems[i].getAttribute("stroke", "none") &&
                elems[i].getAttribute("stroke", "none") != "none") {
                if (elems[i].getAttribute("stroke-linecap") == "round") {
                    console.debug("    INSTRUCTION");
                    cpts = Svgdom.getPointsOfPoly(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.I_collection.insert(cpt) });
                } else {
                    console.debug("    CONTROL FLOW");
                    cpts = Svgdom.getPointsOfPoly(elems[i]);
                    cpts.forEach( function (cpt) {
                        cpt.ownerelement = elems[i];
                        Svgretrieve.C_collection.insert(cpt) });
                }
            } else
                unreg.push(elems[i]);
        }
        console.groupEnd();
        if (unreg.len > 0) console.warn("there were unregistered elements:", unreg);
    },

    registerRectElement: function(rect) {
        var cpts, itv;
        //console.debug("register rect element:", rect);
        if  ( rect.getAttribute("stroke-linecap") == "round" ) {
            console.debug("    INSTRUCTION");
            cpts = Svgdom.getCornersOfRectPoints(rect);
            cpts.forEach( function (cpt) {
                cpt.ownerelement = rect;
                Svgretrieve.I_collection.insert(cpt) });
            return true;
        } else if (rect.getAttribute("fill") != "none") {
            // FIXME proper condition for a data element; cf. issue #77
            // data element
            console.debug("    DATA");
            itv = Svgretrieve._getMainInterval(rect);  // get interval
            itv.push(rect);                            // append pointer to rect element
            Svgretrieve.rect_intervals.insert(itv);
            return true;
        } else if ( rect.getAttribute("stroke-dasharray") ) {
            // selector element
            console.debug("    SELECTOR");
            cpts = Svgdom.getCornersOfRectPoints(rect);
            cpts.forEach( function (cpt) {
                cpt.ownerelement = rect;
                Svgretrieve.S_collection.insert(cpt) });
            return true;
        } else
            return false;
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
