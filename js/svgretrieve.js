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
    kdtree: undefined,
    init: function (svgroot) {
        Svgretrieve.svgroot = svgroot;
        Svgretrieve.clip8root = svgroot.getElementById("clip8");
        if (! Svgretrieve.clip8root) Svgretrieve.clip8root = Svgretrieve.svgroot;
        Svgretrieve.kdtree = new kdTree([], Svgretrieve._distanceCPoints, ["x", "y"]);
    },

    _distanceCPoints: function (cp1, cp2) {
        return Math.sqrt ( Math.pow(cp1.x - cp2.x, 2) +  Math.pow(cp1.y - cp2.y, 2) );
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

    _transformRect_svg2view: function (svgrect) {
        var trafo = Svgretrieve.clip8root.getCTM();
        var p1 = Svgretrieve.svgroot.createSVGPoint();
        var p2 = Svgretrieve.svgroot.createSVGPoint();
        p1.x = svgrect.x;
        p1.y = svgrect.y;
        p2.x = svgrect.x + svgrect.width;
        p2.y = svgrect.y + svgrect.height;
        p1 = p1.matrixTransform(trafo);
        p2 = p2.matrixTransform(trafo);
        return Svgdom.newSVGRect_fromPoints(p1, p2);
    },

    getIntersectedElements: function(arearect) {
        return Svgretrieve.svgroot.getIntersectionList(Svgretrieve._transformRect_svg2view(arearect), Svgretrieve.clip8root);
    },
    getEnclosedElements: function(arearect) {
        return Svgretrieve.svgroot.getEnclosureList(Svgretrieve._transformRect_svg2view(arearect), Svgretrieve.clip8root);
    },
    checkIntersected: function(el, arearect) {
        return Svgretrieve.svgroot.checkIntersection(el, Svgretrieve._transformRect_svg2view(arearect));
    },
    checkEnclosed: function(el, arearect) {
        return Svgretrieve.svgroot.checkEnclosure(el, Svgretrieve._transformRect_svg2view(arearect));
    },

    getCirclesAt: function(c, r1, r2) {
        /** Return all circles roughly centred at `c` with a radius `r1 < radius < r2` (approximately).
        */
        var debug = false;
        if (debug) console.log("[GETCIRCLESAT] c, r1, r2:", c, r1, r2);
        if (parseFloat(r1) >= parseFloat(r2)) throw  "[getCirclesAt] expected r1 < r2.";
        var epsilon = r2/100;   // small width compared to the larger radius
        var candidates;         // A list of candidate circles
        var confirmed = [];     // confirmed circles (hit by all test areas)
        var testareas = [
            Svgdom.newSVGRect (c.x-epsilon, c.y-parseFloat(r2), 2*epsilon, r2-parseFloat(r1)),  // "north"
            Svgdom.newSVGRect (c.x-epsilon, c.y+parseFloat(r1), 2*epsilon, r2-parseFloat(r1)),  // "south"
            Svgdom.newSVGRect (c.x-parseFloat(r2), c.y-epsilon, r2-parseFloat(r1), 2*epsilon),  // "west"
            Svgdom.newSVGRect (c.x+parseFloat(r1), c.y-epsilon, r2-parseFloat(r1), 2*epsilon),  // "east"
            ];     // Areas which should all be hit, for a circle to be confirmed
        if (debug) {
            for (var j = 0; j < testareas.length; j++) {
                console.log("[getCirclesAt]", testareas[j]);
                var r = Svgdom.addRectElement_SVGRect(Svgretrieve.svgroot, testareas[j]);
                r.setAttribute("fill", "#ffff22");
            }
        }
        candidates = Svgretrieve.getIntersectedElements(testareas[0]);
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i] instanceof SVGCircleElement) {
                var reject = false;     // reject the currently tested candidate?
                for (var j = 1; j < testareas.length; j++) {
                    if ( ! Svgretrieve.checkIntersected(candidates[i], testareas[j]) ) {
                        reject = true;
                        break;
                    }
                }
                if (!reject) confirmed.push(candidates[i]);
            }
        }
        return confirmed;
    },

    getLinesFromTo: function(p1, p2, epsilon) {
        /** Return all lines roughly connecting points `p1`, `p2`.
        */
        var debug = false;
        if (debug) console.log("[GETLINESFROMTO] p1, p2:", p1, p2);

        var candidates;         // A list of candidate lines starting at `p1`
        var confirmed = [];     // confirmed lines (other endpoint at `p2`)
        var testareas = [
            Svgdom.epsilonRectAt(p1, epsilon),
            Svgdom.epsilonRectAt(p2, epsilon),
            ];     // Areas which should all be hit
        if (debug) {
            for (var j = 0; j < testareas.length; j++) {
                console.log("[getLinesFromTo]", testareas[j]);
                var r = Svgdom.addRectElement_SVGRect(Svgretrieve.svgroot, testareas[j]);
                r.setAttribute("fill", "#ffff22");
            }
        }
        candidates = Svgretrieve.getIntersectedElements(testareas[0]);
        if (debug) console.log("[getLinesFromTo] candidates", candidates);
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i] instanceof SVGLineElement) {
                var reject = false;     // reject the currently tested candidate?
                for (var j = 1; j < testareas.length; j++) {
                    if ( ! Svgretrieve.checkIntersected(candidates[i], testareas[j]) ) {
                        reject = true;
                        break;
                    }
                }
                if (!reject) confirmed.push(candidates[i]);
            }
        }
        return confirmed;
    },
}
