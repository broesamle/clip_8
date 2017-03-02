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
    _collectTrafos: function (el, svgcontainer) {
        /// collecting all trafos reversely (child to parent)
        var debug = false;
        var trafos = [];
        var tra;
        while (el != svgcontainer) {
            if (el && el.transform.baseVal.numberOfItems > 0) {
                for ( var i = el.transform.baseVal.numberOfItems-1; i >= 0; i-- ) {
                    tra = el.transform.baseVal.getItem(i).matrix;
                    trafos.push(tra);
                }
            }
            el = el.parentElement;
            if      (!el)   console.log("!! NO ELEMENT!", el);
            else if (debug) console.log("newParent:", el);
        }
        return trafos;
    },
    _applyTrafos: function (points, trafos) {
        /// Destructively transform all points in the array
        for (var i = 0; i < trafos.length; i++)
            points.map ( function (p) { return p.matrixTransform(trafos[i]); } );
        return points;
    },

    selectorFromRect: function (rect, svgcontainer) {
        /** Derive a enclosure/intersection rectangle from a DOM rect element.
        *   FIXME: Handle svg viewBox attributes with x, y != 0
        */
        var debug = false;
        var trafos = Svgretrieve._collectTrafos(rect, svgcontainer)
        // make p1 and p2 the edges of rect
        var points = [svgcontainer.createSVGPoint(), svgcontainer.createSVGPoint()];
        points[0].x = rect.x.baseVal.value;
        points[0].y = rect.y.baseVal.value;
        points[1].x = points[0].x + rect.width.baseVal.value;
        points[1].y = points[0].y + rect.height.baseVal.value;
        Svgretrieve._applyTrafos(points, trafos);
        // turn the points back into a rectangle (depending on the arrangement of `p1, p2`)
        var r = svgcontainer.createSVGRect();
        if (points[0].x < points[1].x)  { r.x = points[0].x; r.width  = points[1].x - points[0].x; }
        else                            { r.x = points[1].x; r.width  = points[0].x - points[1].x; }
        if (points[0].y < points[1].y)  { r.y = points[0].y; r.height = points[1].y - points[0].y; }
        else                            { r.y = points[1].y; r.height = points[0].y - points[1].y; }
        if (debug) console.log("selector", r);
        return r;
    },

    enclosingFullHeightStripe: function(line, svgcontainer) {
        /*  Determine the horizontal boundaries enclosing `line`.
            Return a full-height vertical stripe/rectangle (from top to bottom of `svgcontainer`) with corresponding horizontal boundaries.
            Initial use case: Select elements potentially affected by a horizontal cut.
        */
        var trafos = Svgretrieve._collectTrafos(line, svgcontainer)
        var points = [svgcontainer.createSVGPoint(), svgcontainer.createSVGPoint()];
        points[0].x = line.x1.baseVal.value;
        points[0].y = line.y1.baseVal.value;
        points[1].x = line.x2.baseVal.value;
        points[1].y = line.y2.baseVal.value;
        Svgretrieve._applyTrafos(points, trafos);
        var stripe = svgcontainer.createSVGRect();
        if (points[0].x < points[1].x)  { stripe.x = points[0].x; stripe.width  = points[1].x - points[0].x; }
        else                            { stripe.x = points[1].x; stripe.width  = points[0].x - points[1].x; }
        stripe.y = svgcontainer.getAttribute("viewBox").split(" ")[1];
        stripe.height = svgcontainer.getAttribute("viewBox").split(" ")[3];
        // above and below the line
        var above = svgcontainer.createSVGRect();
        var below = svgcontainer.createSVGRect();
        // horizontal direction
        above.x = stripe.x;
        above.width = stripe.width;
        below.x = stripe.x;
        below.width = stripe.width;
        // vertical direction
        if (points[0].y < points[1].y) {
            above.y = points[1].y;
            above.height  = stripe.height - points[1].y;
            below.y = stripe.y;
            below.height  = stripe.height - points[0].y;
        }
        else {
            above.y = points[0].y;
            above.height  = stripe.height - points[0].y;
            below.y = stripe.y;
            below.height  = stripe.height - points[1].y;
        }
        return [stripe, above, below];
    },

    enclosingFullWidthStripe: function(line, svgcontainer) {
        /*  Determine the vertical boundaries enclosing `line`.
            Return a full-width horizontal stripe/rectangle (from left to right of `svgcontainer`) with corresponding vertical boundaries.
            Initial use case: Select elements potentially affected by a vertical cut.
        */
        throw "[enclosingFullWidthStripe] not implemented."
    },

    getEnclosedElements: function(arearect, svgroot) {
        return svgroot.getIntersectionList(arearect, svgroot);
    },

    getCirclesAt: function(c, r1, r2, svgcontainer) {
        /** Return all circles roughly centred at `c` with a radius `r1 < radius < r2` (approximately).
        */
        var debug = false;
        if (debug) console.log("[GETCIRCLESAT] c, r1, r2, svgcontainer:", c, r1, r2, svgcontainer);
        if (parseFloat(r1) >= parseFloat(r2)) throw  "[getCirclesAt] expected r1 < r2.";
        var epsilon = r2/100;   // small width compared to the larger radius
        var candidates;         // A list of candidate circles
        var confirmed = [];     // confirmed circles (hit by all test areas)
        var testareas = [
            Svgdom.newSVGRect (c.x-epsilon, c.y-parseFloat(r2), 2*epsilon, r2-parseFloat(r1), svgcontainer),  // "north"
            Svgdom.newSVGRect (c.x-epsilon, c.y+parseFloat(r1), 2*epsilon, r2-parseFloat(r1), svgcontainer),  // "south"
            Svgdom.newSVGRect (c.x-parseFloat(r2), c.y-epsilon, r2-parseFloat(r1), 2*epsilon, svgcontainer),  // "west"
            Svgdom.newSVGRect (c.x+parseFloat(r1), c.y-epsilon, r2-parseFloat(r1), 2*epsilon, svgcontainer),  // "east"
            ];     // Areas which should all be hit, for a circle to be confirmed
        if (debug) {
            for (var j = 0; j < testareas.length; j++) {
                console.log("[getCirclesAt]", testareas[j]);
                var r = Svgdom.addRectElement_SVGRect(svgcontainer, testareas[j]);
                r.setAttribute("fill", "#ffff22");
            }
        }
        candidates = svgcontainer.getIntersectionList(testareas[0], svgcontainer);
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i] instanceof SVGCircleElement) {
                var reject = false;     // reject the currently tested candidate?
                for (var j = 1; j < testareas.length; j++) {
                    if ( ! svgcontainer.checkIntersection(candidates[i], testareas[j]) ) {
                        reject = true;
                        break;
                    }
                }
                if (!reject) confirmed.push(candidates[i]);
            }
        }
        return confirmed;
    },

    getLinesFromTo: function(p1, p2, epsilon, svgcontainer) {
        /** Return all lines roughly connecting points `p1`, `p2`.
        */
        var debug = false;
        if (debug) console.log("[GETLINESFROMTO] p1, p2, svgcontainer:", p1, p2, svgcontainer);

        var candidates;         // A list of candidate lines starting at `p1`
        var confirmed = [];     // confirmed lines (other endpoint at `p2`)
        var testareas = [
            Svgdom.epsilonRectAt(p1, epsilon, svgcontainer),
            Svgdom.epsilonRectAt(p2, epsilon, svgcontainer),
            ];     // Areas which should all be hit
        if (debug) {
            for (var j = 0; j < testareas.length; j++) {
                console.log("[getLinesFromTo]", testareas[j]);
                var r = Svgdom.addRectElement_SVGRect(svgcontainer, testareas[j]);
                r.setAttribute("fill", "#ffff22");
            }
        }
        candidates = svgcontainer.getIntersectionList(testareas[0], svgcontainer);
        if (debug) console.log("[getLinesFromTo] candidates", candidates);
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i] instanceof SVGLineElement) {
                var reject = false;     // reject the currently tested candidate?
                for (var j = 1; j < testareas.length; j++) {
                    if ( ! svgcontainer.checkIntersection(candidates[i], testareas[j]) ) {
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
