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
    
    getCirclesAt: function(c, r1, r2, svgcontainer) {
        /** Return all circles roughly centred at `c` with a radius `r1 < radius < r2` (approximately).
        */
        throw "[getCirclesAt] not implemented.";
    }
}
