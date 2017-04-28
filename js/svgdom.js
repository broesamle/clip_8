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
        if ( Svgdom.euclidDistance(refpoint, bothends[0]) >
             Svgdom.euclidDistance(refpoint, bothends[1]) )
            bothends.reverse();

        return bothends;
    },

    getBothEndsOfPath: function (path) {
        /** Returns two `SVGPoint`s at both endpoints of a path.
        */
        var debug = false;
        if (path.tagName != "path") throw "[getBothEndsOfPath] expected a path.";
        var endpoints = [Svgdom.svgroot.createSVGPoint(), Svgdom.svgroot.createSVGPoint()];
        var pathdata = path.getAttribute("d").trim();
        if (!pathdata.startsWith("M")) throw ("[getBothEndsOfPath] pathdata should start with M. "+pathdata);
        if (debug) console.log("[GETBOTHENDSOFPATH] pathdata:", pathdata);
        // "-" seems to be an implicit separator, which we make explicit, here
        // also, we remove the "M" at the first position
        pathdata = pathdata.slice(1).replace(/\-/g, " -");
        if (pathdata.split("c").length==2) {
            // relative coords
            var startpoint  = pathdata.split("c")[0].trim().split(/[\s,]+/);
            var curveto     = pathdata.split("c")[1].trim().split(/[\s,]+/);
            if (debug) console.log("[getBothEndsOfPath] curveto:", curveto);
            if (debug) console.log("[getBothEndsOfPath] startpoint:", startpoint);
            if (startpoint.length != 2) throw ("[getBothEndsOfPath] There should be 2 coords for startpoint: "+startpoint);
            if (curveto.length != 6) throw ("[getBothEndsOfPath] There should be 6 coords for curveto: "+curveto+"; "+pathdata);
            endpoints[1].x = parseFloat(startpoint[0]) + parseFloat(curveto[4]);
            endpoints[1].y = parseFloat(startpoint[1]) + parseFloat(curveto[5]);
            if (debug) console.log("[getBothEndsOfPath] endpoint[1] (A):", endpoints[1]);
        }
        else if (pathdata.split("C").length==2) {
            // absolute coords
            var startpoint  = pathdata.split("C")[0].trim().split(/[\s,]+/);
            var curveto     = pathdata.split("C")[1].trim().split(/[\s,]+/);
            if (debug) console.log("[getBothEndsOfPath] curveto", curveto);
            if (debug) console.log("[getBothEndsOfPath] start", startpoint);
            if (startpoint.length != 2) throw ("[getBothEndsOfPath] There should be 2 coords for startpoint: "+startpoint);
            if (curveto.length != 6) throw ("[getBothEndsOfPath] There should be 6 coords for curveto: "+curveto);
            endpoints[1].x = parseFloat(curveto[4]);
            endpoints[1].y = parseFloat(curveto[5]);
            if (debug) console.log("[getBothEndsOfPath] endpoints[1] (B):", endpoints[1]);
        }
        else throw ("[getBothEndsOfPath] Need exactly one curve segment: "+pathdata);
        endpoints[0].x = parseFloat(startpoint[0]);
        endpoints[0].y = parseFloat(startpoint[1]);
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
