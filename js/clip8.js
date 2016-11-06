"use strict";

function clip8initControlFlow(svgroot) {
    var debug = false;
    var epsilon = 1;
    var circles = svgroot.getElementsByTagName("circle");
    var centres = svgdom_addGroup(svgroot);
    var initialflow = null;
    if (debug) var debugvis = svgdom_addGroup(svgroot);

    for ( var i = 0; i < circles.length; i++ ) {
        var r = svgdom_CentreArea(circles[i], epsilon);
        r.setAttribute("fill", "#ffff33");
        centres.appendChild(r);
    }
    for ( var i = 0; i < centres.childNodes.length; i++ ) {
        var sel = svgretrieve_selectorFromRect(centres.childNodes[i], svgroot);
        if (debug) {
            console.log("clip8initControlFlow: selector", sel);
            var debugrect = svgdom_addRect(debugvis, sel.x, sel.y, sel.width, sel.height);
            debugrect.setAttribute("stroke", "#000000");
            debugrect.setAttribute("stroke-width", "0.5");
            debugrect.setAttribute("fill", "none");
            debugrect.setAttribute("pointer-events", "none");
        }
        var hitlist = svgroot.getIntersectionList(sel, centres);
        if (debug)  console.log("clip8initControlFlow: hitlist", hitlist);
        if (hitlist.length == 1) {
            var initarea = svgretrieve_selectorFromRect(hitlist[0], svgroot);
            svgroot.removeChild(centres);
            hitlist = svgroot.getIntersectionList(initarea, svgroot);
            if (debug)  console.log("clip8initControlFlow: initiallocation", hitlist);
            break;
        }
    }
    if (debug) console.log("clip8initControlFlow: els at initial location.", hitlist);
    for ( var i = 0; i < hitlist.length; i++ )
        if (hitlist[i].tagName == "path") return hitlist[i];
    throw "failed to idendify point of entry."
}

function clip8envokeOperation() {
    var svgroot = document.getElementById("clip8svgroot");
    console.log("clip8envokeOperation:", svgroot);
    if (!(svgroot instanceof SVGElement)) { throw "[clip8] no SVG root."; }

    svgdom_setSVGNS(svgroot.namespaceURI);
    var ip = clip8initControlFlow(svgroot);
    console.log("clip8envokeOperation: IP", ip);
}
