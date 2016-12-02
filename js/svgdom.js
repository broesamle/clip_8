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

    newRectElement: function (x,y,w,h) {
        /** Create an SVG DOM rect element */
        var debug = false;
        if (debug) console.log("[newRectElement] x, y, w, h:", x, y, w, h);
        var r = document.createElementNS(Svgdom.SVGNS, "rect");
        r.setAttribute("x",x);
        r.setAttribute("y",y);
        r.setAttribute("width",w);
        r.setAttribute("height",h);
        return r;
    },

    newRectElement_fromSVGRect (r) {
        return Svgdom.newRectElement(r.x, r.y, r.width, r.height);
    },

    epsilonRectAt: function (x, y, epsilon, somesvgelement) {
        var svgroot;
        var debug = false;
        if (debug) console.log("[epsilonRectAt] x, y, epsilon, somesvgelement:", x, y, epsilon, somesvgelement);
        if          (somesvgelement instanceof SVGSVGElement)   svgroot = somesvgelement;
        else if     (somesvgelement instanceof SVGElement)      svgroot = somesvgelement.ownerSVGElement;
        else {
            if (debug) console.log("[epsilonRectAt] invalid svg elment:", somesvgelement);
            throw "[epsilonRectAt] Expected an instance of SVGSVGElement or SVGElement.";
        }
        var r = svgroot.createSVGRect();
        r.x = x-epsilon;
        r.y = y-epsilon
        r.width = epsilon*2;
        r.height = epsilon*2;
        return r;
    },

    addRect: function (parentel,x,y,w,h) {
        var r = Svgdom.newRectElement(x,y,w,h);
        parentel.appendChild(r);
        return r;
    },

    getCentreArea: function (circle, epsilon) {
        /** Returns an SVG rect `r` around the centre of circle.
        *   `width == 2*epsilon`.
        */
        return Svgdom.epsilonRectAt(circle.cx.baseVal.value, circle.cy.baseVal.value, epsilon, circle);
    },

    getEndOfLineArea: function (line, epsilon) {
        /** Returns an SVG rect `r` around the endpoint of `line`.
        *   `width == 2*epsilon`.
        */
        return Svgdom.epsilonRectAt(line.x2.baseVal.value, line.y2.baseVal.value, epsilon, line);
    },

    getEndOfPathArea: function (path, epsilon) {
        /** Returns an SVG rect `r` around the endpoint of a path.
        *   `width == 2*epsilon`.
        */
        var debug = false;
        if (path.tagName != "path") throw "Svgdom.EndOfPathArea: expected a path.";
        var pathdata = path.getAttribute("d").trim();
        if (!pathdata.startsWith("M")) throw ("Svgdom.EndOfPathArea: pathdata should start with M. "+pathdata);
        if (debug) console.log("Svgdom.EndOfPathArea: pathdata", pathdata);
        // "-" seems to be an implicit separator, which we make explicit, here
        // also, we remove the "M" at the first position
        pathdata = pathdata.slice(1).replace(/\-/g, " -");
        if (pathdata.split("c").length==2) {
            // relative coords
            var startpoint  = pathdata.split("c")[0].split(/[\s,]+/);
            var curveto     = pathdata.split("c")[1].split(/[\s,]+/);
            if (debug) console.log("Svgdom.EndOfPathArea: curve coords", curveto);
            if (debug) console.log("Svgdom.EndOfPathArea: start", startpoint);
            if (startpoint.length != 2) throw ("Svgdom.EndOfPathArea: There should be 2 coords for startpoint "+startpoint);
            if (curveto.length != 6) throw ("Svgdom.EndOfPathArea: There should be 6 coords for curveto "+curveto);
            var endx = parseFloat(startpoint[0]) + parseFloat(curveto[4]);
            var endy = parseFloat(startpoint[1]) + parseFloat(curveto[5]);
            if (debug) console.log("Svgdom.EndOfPathArea A: endx, endy", endx, endy);
        }
        else if (pathdata.split("C").length==2) {
            // absolute coords
            var startpoint  = pathdata.split("C")[0].split(/[\s,]+/);
            var curveto     = pathdata.split("C")[1].split(/[\s,]+/);
            if (debug) console.log("Svgdom.EndOfPathArea: curve coords", curveto);
            if (debug) console.log("Svgdom.EndOfPathArea: start", startpoint);
            if (startpoint.length != 2) throw ("Svgdom.EndOfPathArea: There should be 2 coords for startpoint "+startpoint);
            if (curveto.length != 6) throw ("Svgdom.EndOfPathArea: There should be 6 coords for curveto "+curveto);
            var endx = parseFloat(curveto[4]);
            var endy = parseFloat(curveto[5]);
            if (debug) console.log("Svgdom.EndOfPathArea B: endx, endy", endx, endy);
        }
        else throw ("Svgdom.EndOfPathArea: Need exactly one curve segment. "+pathdata);
        return Svgdom.epsilonRectAt(endx, endy, epsilon, path);
    }
}
