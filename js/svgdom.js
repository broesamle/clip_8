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

    newRect: function (x,y,w,h) {
        var debug = false;
        if (debug) console.log("Svgdom.newRect:",x,y,w,h);
        var r = document.createElementNS(Svgdom.SVGNS, "rect");
        //var r = document.createElement("XXX", "rect");
        r.setAttribute("x",x);
        r.setAttribute("y",y);
        r.setAttribute("width",w);
        r.setAttribute("height",h);
        return r;
    },

    addRect: function (parentel,x,y,w,h) {
        var r = Svgdom.newRect(x,y,w,h);
        parentel.appendChild(r);
        return r;
    },

    CentreArea: function (circle, epsilon) {
        /** Returns an SVG rect `r` around the centre of circle.
        *   `width == 2*epsilon`.
        */
        return Svgdom.newRect(circle.cx.baseVal.value-epsilon, circle.cy.baseVal.value-epsilon, epsilon*2, epsilon*2);
    },

    EndOfLineArea: function (line, epsilon) {
        /** Returns an SVG rect `r` around the endpoint of `line`.
        *   `width == 2*epsilon`.
        */
        return Svgdom.newRect(line.x2.baseVal.value-epsilon, line.y2.baseVal.value-epsilon, epsilon*2, epsilon*2);
    },

    EndOfPathArea: function (path, epsilon) {
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
        return Svgdom.newRect(endx-epsilon, endy-epsilon, epsilon*2, epsilon*2);
    }
}
