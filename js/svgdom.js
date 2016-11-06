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
    console.log("svgdom_newRect:",x,y,w,h);
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
