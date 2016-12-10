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

    getCentrePoint: function (circle) {
        /** Returns an SVGPoint at the centre of `circle`.
        */
        var centre = circle.ownerSVGElement.createSVGPoint()
        centre.x = circle.cx.baseVal.value;
        centre.y = circle.cy.baseVal.value;
        return centre;
    },

    getEndOfLinePoint: function (line) {
        /** Returns an SVGPoint at the endpoint of `line`.
        */
        var  end = line.ownerSVGElement.createSVGPoint()
        end.x = line.x2.baseVal.value;
        end.y = line.y2.baseVal.value;
        return end;
    },

    getEndOfPathPoint: function (path) {
        /** Returns an SVGPoint at the endpoint of a path.
        */
        var debug = false;
        if (path.tagName != "path") throw "[getEndOfPathPoint] expected a path.";
        var endpoint = path.ownerSVGElement.createSVGPoint();
        var pathdata = path.getAttribute("d").trim();
        if (!pathdata.startsWith("M")) throw ("[getEndOfPathPoint] pathdata should start with M. "+pathdata);
        if (debug) console.log("[GETENDOFPATHPOINT] pathdata:", pathdata);
        // "-" seems to be an implicit separator, which we make explicit, here
        // also, we remove the "M" at the first position
        pathdata = pathdata.slice(1).replace(/\-/g, " -");
        if (pathdata.split("c").length==2) {
            // relative coords
            var startpoint  = pathdata.split("c")[0].trim().split(/[\s,]+/);
            var curveto     = pathdata.split("c")[1].trim().split(/[\s,]+/);
            if (debug) console.log("[getEndOfPathPoint] curveto:", curveto);
            if (debug) console.log("[getEndOfPathPoint] startpoint:", startpoint);
            if (startpoint.length != 2) throw ("[getEndOfPathPoint] There should be 2 coords for startpoint: "+startpoint);
            if (curveto.length != 6) throw ("[getEndOfPathPoint] There should be 6 coords for curveto: "+curveto+"; "+pathdata);
            endpoint.x = parseFloat(startpoint[0]) + parseFloat(curveto[4]);
            endpoint.y = parseFloat(startpoint[1]) + parseFloat(curveto[5]);
            if (debug) console.log("[getEndOfPathPoint] endpoint (A):", endpoint);
        }
        else if (pathdata.split("C").length==2) {
            // absolute coords
            var startpoint  = pathdata.split("C")[0].trim().split(/[\s,]+/);
            var curveto     = pathdata.split("C")[1].trim().split(/[\s,]+/);
            if (debug) console.log("[getEndOfPathPoint] curveto", curveto);
            if (debug) console.log("[getEndOfPathPoint] start", startpoint);
            if (startpoint.length != 2) throw ("[getEndOfPathPoint] There should be 2 coords for startpoint: "+startpoint);
            if (curveto.length != 6) throw ("[getEndOfPathPoint] There should be 6 coords for curveto: "+curveto);
            endpoint.x = parseFloat(curveto[4]);
            endpoint.y = parseFloat(curveto[5]);
            if (debug) console.log("[getEndOfPathPoint] endpoint (B):", endpoint);
        }
        else throw ("[getEndOfPathPoint] Need exactly one curve segment: "+pathdata);
        return endpoint;
    }
}
