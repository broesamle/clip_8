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

    enclosingFullHeightStripe: function(line, svgcontainer) {
        /*  Determine the horizontal boundaries enclosing `line`.
            Return a full-height vertical stripe/rectangle (from top to bottom of `svgcontainer`) with corresponding horizontal boundaries.
            Initial use case: Select elements potentially affected by a horizontal cut.
        */
        var p1, p2, above, below, stripe, x1, y1, x2, y2, vBy, vBh;
        x1 = line.x1.baseVal.value;
        y1 = line.y1.baseVal.value;
        x2 = line.x2.baseVal.value;
        y2 = line.y2.baseVal.value;
        vBy = svgcontainer.getAttribute("viewBox").split(" ")[1];
        vBh = svgcontainer.getAttribute("viewBox").split(" ")[3];
        
        p1 = svgcontainer.createSVGPoint();
        p2 = svgcontainer.createSVGPoint();
        p1.x = x1;
        p1.y = vBy;
        p2.x = x2;
        p2.y = vBy+vBh;
        stripe = Svgdom.newSVGRect_fromPoints(p1, p2, svgcontainer);
        p1 = svgcontainer.createSVGPoint();
        p2 = svgcontainer.createSVGPoint();
        p1.x = x1;
        p1.y = y1;
        p2.x = x2;
        p2.y = vBy+vBh;
        above = Svgdom.newSVGRect_fromPoints(p1, p2, svgcontainer);
        p1 = svgcontainer.createSVGPoint();
        p2 = svgcontainer.createSVGPoint();
        p1.x = x1;
        p1.y = y1;
        p2.x = x2;
        p2.y = vBy;
        below = Svgdom.newSVGRect_fromPoints(p1, p2, svgcontainer);
        return [stripe, above, below];
    },

    enclosingFullWidthStripe: function(line, svgcontainer) {
        /*  Determine the vertical boundaries enclosing `line`.
            Return a full-width horizontal stripe/rectangle (from left to right of `svgcontainer`) with corresponding vertical boundaries.
            Initial use case: Select elements potentially affected by a vertical cut.
        */
        throw "[enclosingFullWidthStripe] not implemented."
    },

    getIntersectedElements: function(arearect, svgroot) {
        var trafo = svgroot.getCTM();

        var p1 = svgroot.createSVGPoint();
        var p2 = svgroot.createSVGPoint();
        p1.x = arearect.x;
        p1.y = arearect.y;
        p2.x = arearect.x + arearect.width;
        p2.y = arearect.y + arearect.height;
        p1 = p1.matrixTransform(trafo);
        p2 = p2.matrixTransform(trafo);
        var transformedrect = Svgdom.newSVGRect_fromPoints(p1, p2, svgroot);
        return svgroot.getIntersectionList(transformedrect, svgroot);
    },

    getEnclosedElements: function(arearect, svgroot) {
        var trafo = svgroot.getCTM();

        var p1 = svgroot.createSVGPoint();
        var p2 = svgroot.createSVGPoint();
        p1.x = arearect.x;
        p1.y = arearect.y;
        p2.x = arearect.x + arearect.width;
        p2.y = arearect.y + arearect.height;
        p1 = p1.matrixTransform(trafo);
        p2 = p2.matrixTransform(trafo);
        var transformedrect = Svgdom.newSVGRect_fromPoints(p1, p2, svgroot);
        return svgroot.getEnclosureList(transformedrect, svgroot);
    },

    checkIntersected: function(el, arearect, svgroot) {
        var trafo = svgroot.getCTM();

        var p1 = svgroot.createSVGPoint();
        var p2 = svgroot.createSVGPoint();
        p1.x = arearect.x;
        p1.y = arearect.y;
        p2.x = arearect.x + arearect.width;
        p2.y = arearect.y + arearect.height;
        p1 = p1.matrixTransform(trafo);
        p2 = p2.matrixTransform(trafo);
        var transformedrect = Svgdom.newSVGRect_fromPoints(p1, p2, svgroot);
        return svgroot.checkIntersection(el, transformedrect);
    },

    checkEnclosed: function(el, arearect, svgroot) {
        var trafo = svgroot.getCTM();

        var p1 = svgroot.createSVGPoint();
        var p2 = svgroot.createSVGPoint();
        p1.x = arearect.x;
        p1.y = arearect.y;
        p2.x = arearect.x + arearect.width;
        p2.y = arearect.y + arearect.height;
        p1 = p1.matrixTransform(trafo);
        p2 = p2.matrixTransform(trafo);
        var transformedrect = Svgdom.newSVGRect_fromPoints(p1, p2, svgroot);
        return svgroot.checkEnclosure(el, transformedrect);
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
        candidates = Svgretrieve.getIntersectedElements(testareas[0], svgcontainer);
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i] instanceof SVGCircleElement) {
                var reject = false;     // reject the currently tested candidate?
                for (var j = 1; j < testareas.length; j++) {
                    if ( ! Svgretrieve.checkIntersected(candidates[i], testareas[j], svgcontainer) ) {
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
        candidates = Svgretrieve.getIntersectedElements(testareas[0], svgcontainer);
        if (debug) console.log("[getLinesFromTo] candidates", candidates);
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i] instanceof SVGLineElement) {
                var reject = false;     // reject the currently tested candidate?
                for (var j = 1; j < testareas.length; j++) {
                    if ( ! Svgretrieve.checkIntersected(candidates[i], testareas[j], svgcontainer) ) {
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
