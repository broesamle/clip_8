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


"use strict";

/** Processes single SVG elements and their geometric aspects in the DOM
*/
var Svgdom = {
    svgroot: undefined,
    SVGNS: undefined,

    init: function (svgroot) {
        Svgdom.svgroot = svgroot;
        Svgdom.SVGNS = svgroot.namespaceURI;
    },

    euclidDistance: function (p1, p2) {
        return Math.sqrt ( Math.pow(p1.x - p2.x, 2) +  Math.pow(p1.y - p2.y, 2) );
    },

    compareCTMs: function (ctm1, ctm2) {
        return ( ctm1.a == ctm2.a &&
                 ctm1.b == ctm2.b &&
                 ctm1.c == ctm2.c &&
                 ctm1.d == ctm2.d &&
                 ctm1.e == ctm2.e &&
                 ctm1.f == ctm2.f );
    },

    addGroup: function (parentel) {
        var g = document.createElementNS(Svgdom.SVGNS, "g");
        parentel.appendChild(g);
        return g;
    },

    newSVGRect: function (x, y, width, height) {
        /** Create a new SVGRect.
        */
        var r = Svgdom.svgroot.createSVGRect();
        r.x = x;
        r.y = y;
        r.width = width;
        r.height = height;
        return r;
    },

    newSVGRect_fromPoints: function (p1, p2) {
        /** Create a new SVGRect.
        */
        var r = Svgdom.svgroot.createSVGRect();
        r.x = Math.min(p1.x, p2.x);
        r.y = Math.min(p1.y, p2.y);
        r.width = Math.abs(p2.x-p1.x);
        r.height = Math.abs(p2.y-p1.y);
        return r;
    },

    newRectElement: function (x,y,w,h) {
        /** Create an SVG DOM rect element */
        var debug = false;
        if (debug) console.log("[newRectElement] x, y, w, h:", x, y, w, h);
        var r = document.createElementNS(Svgdom.SVGNS, "rect");
        r.setAttribute("x", x);
        r.setAttribute("y", y);
        r.setAttribute("width", w);
        r.setAttribute("height", h);
        return r;
    },

    newRectElement_fromSVGRect: function (r) {
        return Svgdom.newRectElement(r.x, r.y, r.width, r.height);
    },

    addRect: function (parentel,x,y,w,h) {
        var r = Svgdom.newRectElement(x,y,w,h);
        parentel.appendChild(r);
        return r;
    },

    addRectElement_SVGRect (parentel, r) {
        return Svgdom.addRect(parentel, r.x, r.y, r.width, r.height);
    },

    getCornersOfRectPoints: function (rect) {
        var points = [];
        for (var i = 0; i < 4; i++)
            points.push(rect.ownerSVGElement.createSVGPoint());
        points[0].x = rect.x.baseVal.value;
        points[0].y = rect.y.baseVal.value;
        points[1].x = rect.x.baseVal.value + rect.width.baseVal.value;
        points[1].y = rect.y.baseVal.value;
        points[2].x = rect.x.baseVal.value + rect.width.baseVal.value;
        points[2].y = rect.y.baseVal.value + rect.height.baseVal.value;
        points[3].x = rect.x.baseVal.value
        points[3].y = rect.y.baseVal.value + rect.height.baseVal.value;
        return points;

    },

    enclosesRectPoint(svgrect, svgpoint) {
        //console.log("[enclosesRectPoint]", svgrect, svgpoint);
        return svgrect.x <= svgpoint.x &&
            svgrect.y <= svgpoint.y &&
            svgrect.x+svgrect.width >= svgpoint.x &&
            svgrect.y+svgrect.height >= svgpoint.y;
    },

    intersectsRectRectelement: function(svgrect, rectelement) {
        var x1, y1, w1, h1, x2, y2, w2, h2;
        x1 = rectelement.x.baseVal.value;
        y1 = rectelement.y.baseVal.value;
        w1 = rectelement.width.baseVal.value;
        h1 = rectelement.height.baseVal.value;
        x2 = svgrect.x;
        y2 = svgrect.y;
        w2 = svgrect.width;
        h2 = svgrect.height;
        if (x2 < x1 + w1 && x1 < x2 + w2 && y2 < y1 + h1)
            return y1 < y2 + h2;
        else return false;
    },

    enclosesRectRectelement: function(svgrect, rectelement) {
        var x1, y1, w1, h1, x2, y2, w2, h2;
        x1 = rectelement.x.baseVal.value;
        y1 = rectelement.y.baseVal.value;
        w1 = rectelement.width.baseVal.value;
        h1 = rectelement.height.baseVal.value;
        x2 = svgrect.x;
        y2 = svgrect.y;
        w2 = svgrect.width;
        h2 = svgrect.height;
        if (x1 <= x2 && x1+w1 >= x2+w2 &&
            y1 <= y2 )
            return y1+h1 >= y2+h2;
        else return false;
    },

    getCentrePoint: function (circle) {
        /** Returns an SVGPoint at the centre of `circle`.
        */
        var centre = Svgdom.svgroot.createSVGPoint();
        centre.x = circle.cx.baseVal.value;
        centre.y = circle.cy.baseVal.value;
        return centre;
    },

    getRadius: function (circle) {
        return circle.r.baseVal.value;
    },

    getBothEndsOfLine: function (line) {
        /** Returns an SVGPoint at the endpoint of `line`.
        */
        var  start = Svgdom.svgroot.createSVGPoint()
        var  end = Svgdom.svgroot.createSVGPoint()
        start.x = line.x1.baseVal.value;
        start.y = line.y1.baseVal.value;
        end.x = line.x2.baseVal.value;
        end.y = line.y2.baseVal.value;
        return [start, end];
    },

    getBothEndsOfLine_arranged: function(refpoint, line) {
        var bothends = Svgdom.getBothEndsOfLine(line);
        return Svgdom.arrangePoints(refpoint, bothends);
    },

    arrangePoints: function(refpoint, twopoints) {
        if ( Svgdom.euclidDistance(refpoint, twopoints[0]) >
             Svgdom.euclidDistance(refpoint, twopoints[1]) )
            twopoints.reverse();
        return twopoints;
    },

    getAbsoluteControlpoints: function(pathdatastring) {
        var debug = true;
        var path = SvgPath(pathdatastring).abs().unshort();
        var controlpoints = [];
        if (debug) console.groupCollapsed("[getBothEndsOfPath] Parsed path data:")
        path.iterate(function (segment, index, x, y) {
            if (debug) console.log(segment, index, x, y);
            var newpoint = Svgdom.svgroot.createSVGPoint()
            switch (segment[0]) {
                case "M":
                case "L":
                    newpoint.x = segment[1];
                    newpoint.y = segment[2];
                    break;
                case "C":
                    newpoint.x = segment[5];
                    newpoint.y = segment[6];
                    break;
                case "V":
                    newpoint.x = x;
                    newpoint.y = segment[1];
                    break;
                case "H":
                    newpoint.x = segment[1];
                    newpoint.y = y;
                    break;
                case "Z":
                    break;
                default:
                    throw {
                        source: "getAbsoluteControlpoints",
                        error: "unhandled path segment type.",
                        segmenttype: segment[0],
                        hint: Clip8.INTERNAL_ERROR_HINT};
            }
            controlpoints.push(newpoint);
        });
        if (debug) console.groupEnd();
        return controlpoints;
    },

    getBothEndsOfPath: function (path) {
        /** Returns two `SVGPoint`s at both endpoints of a path.
        */
        if (path.tagName != "path") throw "[getBothEndsOfPath] expected a path.";
        var endpoints = [];
        var controlpoints = Svgdom.getAbsoluteControlpoints(path.getAttribute("d").trim());
        if (controlpoints.length < 2)
            throw {
                source:"getBothEndsOfPath",
                error: "Found less than two control points.",
                hint: Clip8.INTERNAL_ERROR_HINT};
        endpoints[0] = controlpoints[0];
        endpoints[1] = controlpoints[controlpoints.length-1];
        return endpoints;
    },

    isClosedPath: function (pathelement) {
        var pathdata = pathelement.getAttribute("d").trim();
        if ( pathdata.indexOf("z") != -1 || pathdata.indexOf("Z") != -1 ) return true;
        else return false;
    },

    isCurvedPath: function (pathelement) {
        var pathdata = pathelement.getAttribute("d").trim();
        if ( pathdata.indexOf("c") != -1 || pathdata.indexOf("C") != -1 ) return true;
        else return false;
    },

    getPointsOfPoly: function (poly, referenceArea) {
    /** Returns the points of a polyline element as `SVGPoint`s.
     */
        if (poly.tagName != "polyline") throw "[getBothEndsOfPoly] expected a polyline.";
        var debug = false;
        var points = [Svgdom.svgroot.createSVGPoint(),
                      Svgdom.svgroot.createSVGPoint(),
                      Svgdom.svgroot.createSVGPoint()];
        var pointdata = poly.getAttribute("points");
        if (debug) console.log("[getBothEndsOfPoly] end:", coords);
        var coords = pointdata.trim().split(/[\s,]+/);
        if (debug) console.log("[getBothEndsOfPoly] coords:", coords);
        points[0].x = parseFloat(coords[0]);
        points[0].y = parseFloat(coords[1]);
        points[1].x = parseFloat(coords[2]);
        points[1].y = parseFloat(coords[3]);
        points[2].x = parseFloat(coords[4]);
        points[2].y = parseFloat(coords[5]);
        return points;
    },
}
