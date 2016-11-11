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
    throw "Failed to idendify point of entry."
}

function clip8getPrimInstruction (ip, svgroot) {
    var debug = true;
    if (debug) console.log("clip8getPrimInstruction", ip, svgroot);
    if (!(ip.tagName == "path"))
        throw "[clip8] ip element is not a path.";
    var epsilon = 0.5;
    var endarearect = svgdom_EndOfPathArea(ip, epsilon);
    endarearect.setAttribute("fill", "#FFEE22");
    if (debug) console.log("end of path area rect", endarearect);
    svgroot.appendChild(endarearect);
    var endarea = svgretrieve_selectorFromRect(endarearect, svgroot);
    svgroot.removeChild(endarearect);
    var hitlist = svgroot.getIntersectionList(endarea, svgroot);
    if (debug) console.log("clip8getPrimInstruction: empty hitlist");
    if (hitlist.length == 0) throw " ip element is not a path.";
    var sel = svgdom_addGroup(svgroot);
    var instr1 = svgdom_addGroup(svgroot);
    for ( var i = 0; i < hitlist.length; i++ )
        if (hitlist[i].getAttribute("stroke-linecap") == "round" ||
            hitlist[i].tagName == "circle") {
            instr1.appendChild(hitlist[i].cloneNode(false));
            instr1.lastElementChild.setAttribute("stroke", "#FFEE22");
        }
        else if (hitlist[i].getAttribute("stroke-dasharray") &&
            hitlist[i].tagName == "rect") {
            sel.appendChild(hitlist[i].cloneNode(false));
            sel.lastElementChild.setAttribute("stroke", "#FFEE22");
        }
    return [instr1,sel];
}

function clip8envokeOperation() {
    var debug = true;
    var svgroot = document.getElementById("clip8svgroot");
    console.log("clip8envokeOperation:", svgroot);
    if (!(svgroot instanceof SVGElement)) { throw "[clip8] no SVG root."; }

    svgdom_setSVGNS(svgroot.namespaceURI);
    var ip = clip8initControlFlow(svgroot);     // instruction pointer: the active control flow path
    if (debug) console.log("clip8envokeOperation: IP", ip);
    var instr1 = clip8getPrimInstruction(ip, svgroot)[0];
    var sel1 = clip8getPrimInstruction(ip, svgroot)[1];
}
