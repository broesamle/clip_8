"use strict";

function clip8initControlFlow(svgroot, tracesvgroot) {
    var debug = false;
    var epsilon = 1;
    var circles = svgroot.getElementsByTagName("circle");
    var centres = svgdom_addGroup(svgroot);
    var initialflow = null;

    for ( var i = 0; i < circles.length; i++ ) {
        var r = svgdom_CentreArea(circles[i], epsilon);
        r.setAttribute("fill", "#ffff33");
        centres.appendChild(r);
    }
    for ( var i = 0; i < centres.childNodes.length; i++ ) {
        var sel = svgretrieve_selectorFromRect(centres.childNodes[i], svgroot);
        var hitlist = svgroot.getIntersectionList(sel, centres);
        if (debug)  console.log("clip8initControlFlow: hitlist", hitlist);
        if (hitlist.length == 1) {
            var initarea = svgretrieve_selectorFromRect(hitlist[0], svgroot);
            // visualise initial control flow node
            var tracerect = svgdom_addRect(tracesvgroot, initarea.x-3,initarea.y-3, initarea.width+6, initarea.height+6);
            clip8setTraceAttribs(tracerect);
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
    var debug = false;
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
    if (debug) console.log("clip8getPrimInstruction: hitlist", hitlist);
    if (hitlist.length == 0) throw " ip element is not a path.";
    var sel = svgdom_addGroup(svgroot);
    var instr1 = svgdom_addGroup(svgroot);
    for ( var i = 0; i < hitlist.length; i++ )
        if (hitlist[i].getAttribute("stroke-linecap") == "round" ||
            hitlist[i].tagName == "circle") {
            instr1.appendChild(hitlist[i].cloneNode(false));
            instr1.lastElementChild.setAttribute("stroke", "#fff");
        }
        else if (hitlist[i].getAttribute("stroke-dasharray") &&
            hitlist[i].tagName == "rect") {
            sel.appendChild(hitlist[i].cloneNode(false));
            sel.lastElementChild.setAttribute("stroke", "#fff");
        }
    return [instr1,sel];
}

function clip8envokeOperation() {
    var debug = true;
    var svgroot = document.getElementById("clip8svgroot");
    console.log("clip8envokeOperation:", svgroot);
    if (!(svgroot instanceof SVGElement)) { throw "[clip8] no SVG root."; }

    svgdom_setSVGNS(svgroot.namespaceURI);

    var tracesvgroot = svgroot.cloneNode(false);
    svgroot.parentNode.appendChild(tracesvgroot);
    tracesvgroot.setAttribute("style", "margin-left:-64; background:none;");
    var ip = clip8initControlFlow(svgroot, tracesvgroot);     // instruction pointer: the active control flow path
    var running = true;
    while (running) {
        if (debug) console.log("clip8envokeOperation: IP", ip);
        var instrNsel = clip8getPrimInstruction(ip, svgroot)
        var instr1 = instrNsel[0];
        var sel1 = instrNsel[1];
        // decode instruction
        if (debug) console.log("clip8envokeOperation: INSTR1, SEL1", instr1, sel1);
        switch (instr1.childElementCount) {
            case 1:
                break;
            case 2:
                if (debug) console.log("clip8envokeOperation: 2");
                if (instr1.childNodes[0].tagName == "circle" &&
                    instr1.childNodes[1].tagName == "circle") {
                    if (debug) console.log("clip8envokeOperation: TERMINAL.");
                    running = false; // two concentric circles: terminal.
                }
                else throw "Could not decode instruction A"+instr1;
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
            default:
                throw "Could not decode instruction X"+instr1;
        }
        svgroot.removeChild(instr1);
        svgroot.removeChild(sel1);
        tracesvgroot.appendChild(instr1);
        tracesvgroot.appendChild(sel1);
        if (debug) console.log("clip8envokeOperation: removed instr1, sel1", instr1, sel1);
    }
    var erasetracetimer = setInterval( function() { eraseTrace(tracesvgroot) }, 60 );
    setTimeout ( function () { clearInterval(erasetracetimer) }, 10000 );   // stop erasor after some time
}

function eraseTrace (svgroot) {
    var itemopacity;
    for ( var i = 0; i < svgroot.childNodes.length; i++ ) {
        itemopacity = svgroot.childNodes[i].getAttribute("opacity");
        if (itemopacity == null)
            svgroot.childNodes[i].setAttribute("opacity", "1.0");
        else
            if (itemopacity < 0.4) svgroot.removeChild(svgroot.childNodes[i]);
            else svgroot.childNodes[i].setAttribute("opacity", itemopacity-0.04);
    }
}

function clip8setTraceAttribs(el) {
    el.setAttribute("stroke", "#88aaff");
    el.setAttribute("stroke-width", "1");
    el.setAttribute("fill", "none");
    el.setAttribute("pointer-events", "none");
}
