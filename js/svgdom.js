"use strict";

var Svgdom = {
    SVGNS: undefined,

    setSVGNS: function (namespace) {
        Svgdom.SVGNS = namespace;
    },

    addGroup: function (parentel) {
        var g = document.createElementNS(Svgdom.SVGNS, "g");
        parentel.appendChild(g);
        return g;
    },

    newSVGRect: function (x, y, width, height, svgroot) {
        /** Create a new SVGRect.
        */
        var r = svgroot.createSVGRect();
        r.x = x;
        r.y = y;
        r.width = width;
        r.height = height;
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

    newRectElement_fromSVGRect (r) {
        return Svgdom.newRectElement(r.x, r.y, r.width, r.height);
    },

    epsilonRectAt: function (p, epsilon, somesvgelement) {
        var svgroot;
        var debug = false;
        if (debug) console.log("[epsilonRectAt] p, epsilon, somesvgelement:", p, epsilon, somesvgelement);
        if          (somesvgelement instanceof SVGSVGElement)   svgroot = somesvgelement;
        else if     (somesvgelement instanceof SVGElement)      svgroot = somesvgelement.ownerSVGElement;
        else {
            if (debug) console.log("[epsilonRectAt] invalid svg elment:", somesvgelement);
            throw "[epsilonRectAt] Expected an instance of SVGSVGElement or SVGElement.";
        }
        var r = svgroot.createSVGRect();
        r.x = p.x-epsilon;
        r.y = p.y-epsilon;
        r.width = epsilon*2;
        r.height = epsilon*2;
        return r;
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

    getCentrePoint: function (circle) {
        /** Returns an SVGPoint at the centre of `circle`.
        */
        var centre = circle.ownerSVGElement.createSVGPoint()
        centre.x = circle.cx.baseVal.value;
        centre.y = circle.cy.baseVal.value;
        return centre;
    },

    getBothEndsOfLine: function (line) {
        /** Returns an SVGPoint at the endpoint of `line`.
        */
        var  start = line.ownerSVGElement.createSVGPoint()
        var  end = line.ownerSVGElement.createSVGPoint()
        start.x = line.x1.baseVal.value;
        start.y = line.y1.baseVal.value;
        end.x = line.x2.baseVal.value;
        end.y = line.y2.baseVal.value;
        return [start, end];
    },

    getBothEndsOfPath: function (path) {
        /** Returns two `SVGPoint`s at both endpoints of a path.
        */
        var debug = false;
        if (path.tagName != "path") throw "[getBothEndsOfPath] expected a path.";
        var endpoints = [path.ownerSVGElement.createSVGPoint(), path.ownerSVGElement.createSVGPoint()];
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

    getPointsOfPoly: function (poly, referenceArea) {
    /** Returns the points of a polyline element as `SVGPoint`s.
     */
        if (poly.tagName != "polyline") throw "[getBothEndsOfPoly] expected a polyline.";
        var debug = false;
        var points = [poly.ownerSVGElement.createSVGPoint(),
                      poly.ownerSVGElement.createSVGPoint(),
                      poly.ownerSVGElement.createSVGPoint()];
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
