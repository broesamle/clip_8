"use strict";

var SVGNS=undefined;

function svgdom_setSVGNS(namespace) {
    SVGNS = namespace;
}

function svgdom_addGroup(parentel) {
    var g = document.createElementNS(SVGNS, "g");
    parentel.appendChild(g);
    return g;
}

function svgdom_newRect(x,y,w,h) {
    var debug = false;
    if (debug) console.log("svgdom_newRect:",x,y,w,h);
    var r = document.createElementNS(SVGNS, "rect");
    //var r = document.createElement("XXX", "rect");
    r.setAttribute("x",x);
    r.setAttribute("y",y);
    r.setAttribute("width",w);
    r.setAttribute("height",h);
    return r;
}

function svgdom_addRect(parentel,x,y,w,h) {
    var r = svgdom_newRect(x,y,w,h);
    parentel.appendChild(r);
    return r;
}

function svgdom_CentreArea(circle, epsilon) {
    /** Returns an SVG rect `r` around the centre of circle.
    *   `width == 2*epsilon`.
    */
    return svgdom_newRect(circle.cx.baseVal.value-epsilon, circle.cy.baseVal.value-epsilon, epsilon*2, epsilon*2);
}

function svgdom_EndOfLineArea(line, epsilon) {
    /** Returns an SVG rect `r` around the endpoint of `line`.
    *   `width == 2*epsilon`.
    */
    return svgdom_newRect(line.x2.baseVal.value-epsilon, line.y2.baseVal.value-epsilon, epsilon*2, epsilon*2);
}

function svgdom_EndOfPathArea(path, epsilon) {
    /** Returns an SVG rect `r` around the endpoint of a path.
    *   `width == 2*epsilon`.
    */
    var debug = false;
    if (path.tagName != "path") throw "svgdom_EndOfPathArea: expected a path.";
    var pathdata = path.getAttribute("d").trim();
    if (!pathdata.startsWith("M")) throw ("svgdom_EndOfPathArea: pathdata should start with M. "+pathdata);
    if (debug) console.log("svgdom_EndOfPathArea: pathdata", pathdata);
    // "-" seems to be an implicit separator, which we make explicit, here
    // also, we remove the "M" at the first position
    pathdata = pathdata.slice(1).replace(/\-/g, " -");
    if (pathdata.split("c").length==2) {
        // relative coords
        var startpoint  = pathdata.split("c")[0].split(/[\s,]+/);
        var curveto     = pathdata.split("c")[1].split(/[\s,]+/);
        if (debug) console.log("svgdom_EndOfPathArea: curve coords", curveto);
        if (debug) console.log("svgdom_EndOfPathArea: start", startpoint);
        if (startpoint.length != 2) throw ("svgdom_EndOfPathArea: There should be 2 coords for startpoint "+startpoint);
        if (curveto.length != 6) throw ("svgdom_EndOfPathArea: There should be 6 coords for curveto "+curveto);
        var endx = parseFloat(startpoint[0]) + parseFloat(curveto[4]);
        var endy = parseFloat(startpoint[1]) + parseFloat(curveto[5]);
        if (debug) console.log("svgdom_EndOfPathArea A: endx, endy", endx, endy);
    }
    else if (pathdata.split("C").length==2) {
        // absolute coords
        var startpoint  = pathdata.split("C")[0].split(/[\s,]+/);
        var curveto     = pathdata.split("C")[1].split(/[\s,]+/);
        if (debug) console.log("svgdom_EndOfPathArea: curve coords", curveto);
        if (debug) console.log("svgdom_EndOfPathArea: start", startpoint);
        if (startpoint.length != 2) throw ("svgdom_EndOfPathArea: There should be 2 coords for startpoint "+startpoint);
        if (curveto.length != 6) throw ("svgdom_EndOfPathArea: There should be 6 coords for curveto "+curveto);
        var endx = parseFloat(curveto[4]);
        var endy = parseFloat(curveto[5]);
        if (debug) console.log("svgdom_EndOfPathArea B: endx, endy", endx, endy);
    }
    else throw ("svgdom_EndOfPathArea: Need exactly one curve segment. "+pathdata);
    return svgdom_newRect(endx-epsilon, endy-epsilon, epsilon*2, epsilon*2);
}
