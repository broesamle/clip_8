"use strict";

// drawing precision tolerances
var epsilon = 0.5;  // maximal difference for two coordinates to be considered equal
var minlen = 1.5;     // minimal size of a graphics element to be "meaningful"

var Clip8 = {
    exectimer: null,
    ip: null,       // instruction pointer
    blocklist: [],  // list of elements already retrieved during current instruction cycle.

    _isBlocklisted: function (el) {
        var debug = false;
        for (var i = 0; i < Clip8.blocklist.length; i++)
            if (el == Clip8.blocklist[i]) {
                if (debug) console.log("[_isBlocklisted] TRUE ... el, Clip8.blocklist:", el, Clip8.blocklist);
                return true;
            }
        if (debug) console.log("[_isBlocklisted] FALSE ... el, Clip8.blocklist:", el, Clip8.blocklist);
        return false;
    },

    _setRetrievedAttribs: function (el) {
        el.setAttribute("stroke", "#fff");
        el.setAttribute("pointer-events", "none");
    },

    initControlFlow: function (svgroot, tracesvgroot) {
        var debug = false;
        var circles = svgroot.getElementsByTagName("circle");
        var centres = Svgdom.addGroup(svgroot);
        var initialflow = null;

        for ( var i = 0; i < circles.length; i++ ) {
            var arearect = Svgdom.epsilonRectAt(Svgdom.getCentrePoint(circles[i]), epsilon, svgroot);
            var r = Svgdom.newRectElement_fromSVGRect(arearect, svgroot);
            r.setAttribute("fill", "#ffff33");
            centres.appendChild(r);
        }
        for ( var i = 0; i < centres.childNodes.length; i++ ) {
            var sel = Svgretrieve.selectorFromRect(centres.childNodes[i], svgroot);
            var hitlist = svgroot.getIntersectionList(sel, centres);
            if (debug)  console.log("[clip8initControlFlow] hitlist:", hitlist);
            if (hitlist.length == 1) {
                var initarea = Svgretrieve.selectorFromRect(hitlist[0], svgroot);
                svgroot.removeChild(centres);
                hitlist = svgroot.getIntersectionList(initarea, svgroot);
                if (debug)  console.log("[clip8initControlFlow] initiallocation:", hitlist);
                break;
            }
        }
        if (debug) console.log("[clip8initControlFlow] els at initial location:", hitlist);
        for ( var i = 0; i < hitlist.length; i++ )
            if (hitlist[i].tagName == "path") return hitlist[i];
        throw "Failed to idendify point of entry."
    },

    retrieveISCElements: function (arearect, svgroot) {
        var debug = false;
        if (debug) console.log("[RETRIEVEISCELEMENTS] arearect, svgroot:", arearect, svgroot);
        var hitlist = svgroot.getIntersectionList(arearect, svgroot);
        if (debug)  console.log("[retrieveISCElements] hitlist:", hitlist);
        if (hitlist.length == 0) throw "[retrieveISCElements] empty hitlist.";
        var sel = Svgdom.addGroup(svgroot);
        var instr = Svgdom.addGroup(svgroot);
        var nextIP = null;
        for ( var i = 0; i < hitlist.length; i++ ) {
            if (!Clip8._isBlocklisted(hitlist[i])) {
                if (hitlist[i].getAttribute("stroke-linecap") == "round" ||
                    hitlist[i].tagName == "circle") {
                    instr.appendChild(hitlist[i].cloneNode(false));
                    Clip8._setRetrievedAttribs(instr.lastElementChild);
                    Clip8.blocklist.push(hitlist[i]);
                }
                else if (hitlist[i].getAttribute("stroke-dasharray") &&
                    hitlist[i].tagName == "rect") {
                    sel.appendChild(hitlist[i].cloneNode(false));
                    Clip8._setRetrievedAttribs(sel.lastElementChild);
                    Clip8.blocklist.push(hitlist[i]);
                }
                else if (hitlist[i].getAttribute("stroke-linecap") != "round" &&
                    hitlist[i].tagName == "path" ) {
                    if (hitlist[i] != Clip8.ip)     //make sure it is not the old ip
                        if (nextIP == null) nextIP = hitlist[i];
                        else throw "Instruction Pointer ambiguous.";
                }
            }
            else
                if (debug) console.log("[retrieveISCElements] ignore blocklisted element:", Clip8._isBlocklisted(hitlist[i]) );
        }
        return [instr, sel, nextIP];
    },

    getSelectedElements: function(selectorelements, svgroot) {
        /** Retreve the set of selected objects as defined by a given selector.
         *  `selectorelements` is the list of SVG DOM elments being the selector
         *  part of an instruction. These elements graphically depict the selector.
         *  Return value is a list of SVG DOM elements that are selected by the given selector. */

        var debug = false;
        if (debug) console.log("[GETSELECTEDELEMENTS] arearect:", selectorelements, svgroot);

        // List of selected Elements based on primary selector
        var selection = [];
        if (selectorelements[0] instanceof SVGRectElement) {
            var s = Svgretrieve.selectorFromRect(selectorelements[0], svgroot);
            if (debug) console.log("[executeOneOperation] selector from rect in selectorelements:", s);
            var hitlist = svgroot.getEnclosureList(s, svgroot);
            for ( var i = 0; i < hitlist.length; i++ )
                if ( hitlist[i].tagName == "rect" &&
                     (!hitlist[i].getAttribute("stroke") || hitlist[i].getAttribute("stroke")!= "none") )
                     selection.push(hitlist[i]);
        }
        else selection = undefined;
        return selection;
    },

    executeOneOperation: function(svgroot, tracesvgroot) {
        var debug = true;
        var terminate = false;  // This is a local variable, not a global running flag.
        if (debug) console.log("[EXECUTEONEOPERATION] Clip8.ip, svgroot, tracesvgroot:", Clip8.ip, svgroot, tracesvgroot);
        if (Clip8.ip.tagName != "path") throw "[executeOneOperation] ip element is not a path.";

        var p0 = Svgdom.getEndOfPathPoint(Clip8.ip);
        var p0area = Svgdom.epsilonRectAt(p0, epsilon, svgroot);
        Clip8.blocklist = [];   // reset the blocklist; we are fetching a new instruction
        var instrNsel = Clip8.retrieveISCElements(p0area, svgroot);
        if (debug) console.log("[executeOneOperation] instrNsel (A) [0, 1, 2]:", instrNsel[0].childNodes, instrNsel[1].childNodes, instrNsel[2]);
        var instr1 = instrNsel[0];
        var sel1 = instrNsel[1];
        Clip8.ip = instrNsel[2];
        var selectedelements1 = Clip8.getSelectedElements(sel1.childNodes, svgroot);
        if (debug) console.log("[executeOneOperation] selectedelements1:", selectedelements1);

        // decode instruction
        var signature = Clip8decode.countTags(instr1, ["circle", "path", "rect", "line", "polyline"]);
        if (debug) console.log("[executeOneOperation] signature:", signature);
        if ( signature.toString() === [2, 0, 0, 0, 0].toString() ) {
            if (debug) console.log("[executeOneOperation] two circles.");
            if (instr1.childNodes[0].tagName == "circle" &&
                instr1.childNodes[1].tagName == "circle") {
                if (debug) console.log("[executeOneOperation] TERMINAL.");
                terminate = true;
            }
            else throw "Could not decode instruction A"+instr1;
        }
        else if ( signature.toString() === [0, 0, 0, 1, 1].toString() ) {
            // ALIGN
            if (debug) console.log("[executeOneOperation] 1 line, 1 polyline.");
            var theline = instr1.getElementsByTagName("line")[0];
            var linedir = Clip8decode.directionOfSVGLine(theline, epsilon, minlen);
            if (debug) console.log("[executeOneOperation] direction:", linedir);
            var thepoly = instr1.getElementsByTagName("polyline")[0];
            var angledir = Clip8decode.directionOfPolyAngle(thepoly, epsilon, minlen);
            if (debug) console.log("[executeOneOperation] angle direction:", angledir);
            var arearect = Svgdom.epsilonRectAt(Svgdom.getEndOfLinePoint(theline), epsilon, svgroot);
            var instrNsel = Clip8.retrieveISCElements(arearect, svgroot);
            if (debug) console.log("[executeOneOperation] instrNsel(B) [0, 1]:", instrNsel[0].childNodes, instrNsel[1].childNodes);
            var instr2 = instrNsel[0];
            var sel2 = instrNsel[1];
            var snd_signature = Clip8decode.countTags(instr2, ["rect"]);
            if (snd_signature.toString() === [1].toString() )
                selectedelements1.push(instr2.firstChild); // Add the absolute rectangle to the selected set.
            switch (linedir) {
                case 'UP':
                case 'DOWN':
                    if (angledir == 'LEFT')         Paperclip.alignrelLeft (selectedelements1);
                    else if (angledir == 'RIGHT')   Paperclip.alignrelRight (selectedelements1);
                    else throw "[executeOneOperation] Encountered invalid line arrow combination (a).";
                    break;
                case 'LEFT':
                case 'RIGHT':
                    if (angledir == 'UP')           Paperclip.alignrelTop (selectedelements1);
                    else if (angledir == 'DOWN')    Paperclip.alignrelBottom (selectedelements1);
                    else throw "[executeOneOperation] Encountered invalid line arrow combination (b).";
                    break;
                default:        throw "[executeOneOperation] Encountered invalid line direction (a)."; break;
            }
            if (debug) console.log("[executeOneOperation] remove instr2, sel2:", instr2, sel2);
            svgroot.removeChild(instr2);
            svgroot.removeChild(sel2);
            tracesvgroot.appendChild(instr2);
            tracesvgroot.appendChild(sel2);
        }
        else if ( signature.toString() === [0, 0, 0, 1, 0].toString() ) {
            // MOVE-REL, CUT
            if (debug) console.log("[executeOneOperation] 1 line.");
            var theline = instr1.getElementsByTagName("line")[0];
            if (theline.getAttribute("stroke-dasharray")) {
                // CUT
                var linedir = Clip8decode.directionOfSVGLine(theline, epsilon, minlen);
                switch (linedir) {
                    case 'UP':
                    case 'DOWN':

                        break;
                    case 'LEFT':
                    case 'RIGHT':
                        var stripeNaboveNbelow = Svgretrieve.enclosingFullHeightStripe(theline, svgroot);
                        var stripe = stripeNaboveNbelow[0];
                        var above = stripeNaboveNbelow[1];
                        var below = stripeNaboveNbelow[2];
                        if (debug) console.log("[executeOneOperation] stripe, above, below:", stripe, above, below);
                        var hitlist = svgroot.getEnclosureList(stripe, svgroot);
                        if (debug) console.log("[executeOneOperation] hitlist:", hitlist);
                        var selectedelements1 = []
                        for (var i = 0; i < hitlist.length; i++)
                            if ( svgroot.checkIntersection(hitlist[i], above) && svgroot.checkIntersection(hitlist[i], below) )
                                selectedelements1.push(hitlist[i]);
                        if (debug) console.log("[executeOneOperation] selectedelements1:", selectedelements1);
                        Paperclip.cutHorizontal(selectedelements1, theline.getAttribute("y1"));
                        break;
                    default:        throw "[executeOneOperation] Encountered invalid line direction (b).";  break;
                }
            }
            else {
                // MOVE-REL
                var p1 = Svgdom.getEndOfLinePoint(theline);
                var circles = Svgretrieve.getCirclesAt(
                    p1,
                    theline.getAttribute("stroke-width"),       // use as minimum radius
                    theline.getAttribute("stroke-width") * 4,   // use as minimum radius
                    svgroot);
                if (debug) console.log("[executeOneOperation/move-rel] circles:", circles);
                Paperclip.moveBy(selectedelements1, p1.x-p0.x, p1.y-p0.y);
            }
        }
        else
            throw "Could not decode instruction X"+instr1;
        if (debug) console.log("[executeOneOperation] remove instr1, sel1:", instr1, sel1);
        svgroot.removeChild(instr1);
        svgroot.removeChild(sel1);
        tracesvgroot.appendChild(instr1);
        tracesvgroot.appendChild(sel1);
        if (terminate) Clip8.clearExecTimer();
    },

    envokeOperation: function () {
        var debug = true;
        var svgroot = document.getElementById("clip8svgroot");
        console.log("[CLIP8ENVOKEOPERATION] svgroot:", svgroot);
        if (!(svgroot instanceof SVGElement)) { throw "[clip8] no SVG root."; }

        Svgdom.setSVGNS(svgroot.namespaceURI);

        var tracesvgroot = svgroot.cloneNode(false);
        svgroot.parentNode.appendChild(tracesvgroot);
        tracesvgroot.setAttribute("style", "margin-left:-64; background:none;");
        Clip8.ip = Clip8.initControlFlow(svgroot, tracesvgroot);     // instruction pointer: the active control flow path
        Clip8.exectimer = setInterval( function() { Clip8.executeOneOperation(svgroot, tracesvgroot) }, 50 );
        var erasetracetimer = setInterval( function() { eraseTrace(tracesvgroot) }, 60 );
        setTimeout ( function () { clearInterval(erasetracetimer); }, 1000 );   // stop erasor after some time
    },

    clearExecTimer: function () {
        clearInterval(Clip8.exectimer);
    }
};

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
