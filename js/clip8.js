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
                if (debug) console.log("[_isBlocklisted] TRUE ... el, Clip8.blocklist", el, Clip8.blocklist);
                return true;
            }
        if (debug) console.log("[_isBlocklisted] FALSE ... el, Clip8.blocklist", el, Clip8.blocklist);
        return false;
    },

    _setRetrievedAttribs: function (el) {
        el.setAttribute("stroke", "#fff");
        el.setAttribute("pointer-events", "none");
    },

    initControlFlow: function (svgroot, tracesvgroot) {
        var debug = false;
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
    },

    getInstrEls_asGroups: function (arearect, svgroot) {
        var debug = false;
        if (debug) console.log("[getInstrEls_asGroups] arearect, svgroot", arearect, svgroot);
        arearect.setAttribute("fill", "#FFEE22");
        svgroot.appendChild(arearect);
        var s = svgretrieve_selectorFromRect(arearect, svgroot);
        svgroot.removeChild(arearect);
        var hitlist = svgroot.getIntersectionList(s, svgroot);
        if (debug)  console.log("[getInstrEls_asGroups] hitlist:", hitlist);
        if (hitlist.length == 0) throw "[clip8getInstrEls_asGroups] empty hitlist.";
        var sel = svgdom_addGroup(svgroot);
        var instr = svgdom_addGroup(svgroot);
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
                if (debug) console.log("[getInstrEls_asGroups] ignore blocklisted element: ", Clip8._isBlocklisted(hitlist[i]) );
        }
        return [instr, sel, nextIP];
    },

    executeOneOperation: function(svgroot, tracesvgroot) {
        var debug = true;
        var terminate = false;  // This is a local variable, not a global running flag.
        if (debug) console.log("[executeOneOperation] Clip8.ip, svgroot, tracesvgroot:", Clip8.ip, svgroot, tracesvgroot);
        if (Clip8.ip.tagName != "path") throw "[executeOneOperation] ip element is not a path.";
        var arearect = svgdom_EndOfPathArea(Clip8.ip, epsilon);
        Clip8.blocklist = [];   // reset the blocklist; we are fetching a new instruction
        var instrNsel = Clip8.getInstrEls_asGroups(arearect, svgroot);
        if (debug) console.log("[clip8envokeOperation] instrNsel: ", instrNsel);
        var instr1 = instrNsel[0];
        var sel1 = instrNsel[1];
        Clip8.ip = instrNsel[2];

        // List of selected Elements based on primary selector
        var selectedelements1 = [];
        if (sel1.firstChild instanceof SVGRectElement) {
            var s = svgretrieve_selectorFromRect(sel1.firstChild, svgroot);
            if (debug) console.log("clip8envokeOperation: selector from rect in sel1", s);
            var hitlist = svgroot.getEnclosureList(s, svgroot);
            for ( var i = 0; i < hitlist.length; i++ )
                if ( hitlist[i].tagName == "rect" &&
                     (!hitlist[i].getAttribute("stroke") || hitlist[i].getAttribute("stroke")!= "none") )
                     selectedelements1.push(hitlist[i]);
        }
        else selectedelements1 = undefined;

        if (debug) console.log("clip8envokeOperation: selectedelements1", selectedelements1);

        // decode instruction
        var signature = clip8countTags(instr1, ["circle", "path", "rect", "line", "polyline"]);
        if (debug) console.log("clip8envokeOperation: signature", signature);
        if ( signature.toString() === [2, 0, 0, 0, 0].toString() ) {
            if (debug) console.log("clip8envokeOperation: two circles");
            if (instr1.childNodes[0].tagName == "circle" &&
                instr1.childNodes[1].tagName == "circle") {
                if (debug) console.log("clip8envokeOperation: TERMINAL.");
                terminate = true;
            }
            else throw "Could not decode instruction A"+instr1;
        }
        else if ( signature.toString() === [0, 0, 0, 1, 1].toString() ) {
            if (debug) console.log("clip8envokeOperation: 1 line, 1 polyline.");
            var theline = instr1.getElementsByTagName("line")[0];
            var linedir = clip8directionOfSVGLine(theline, epsilon, minlen);
            if (debug) console.log("clip8envokeOperation: direction", linedir);
            var thepoly = instr1.getElementsByTagName("polyline")[0];
            var angledir = clip8directionOfPolyAngle(thepoly, epsilon, minlen);
            if (debug) console.log("clip8envokeOperation: angle direction", angledir);
            var arearect = svgdom_EndOfLineArea(theline, epsilon);
            var instrNsel = Clip8.getInstrEls_asGroups(arearect, svgroot);
            var instr2 = instrNsel[0];
            var sel2 = instrNsel[1];
            if (debug) console.log("[clip8envokeOperation] instr2, sel2:", instr2, sel2);
            switch (linedir) {
                case 'UP':
                case 'DOWN':
                    if (angledir == 'LEFT')         paperclip_alignrelLeft (selectedelements1);
                    else if (angledir == 'RIGHT')   paperclip_alignrelRight (selectedelements1);
                    else throw "[clip8envokeOperation] Encountered invalid line arrow combination (a).";
                    break;
                case 'LEFT':
                case 'RIGHT':
                    if (angledir == 'UP')           paperclip_alignrelTop (selectedelements1);
                    else if (angledir == 'DOWN')    paperclip_alignrelBottom (selectedelements1);
                    else throw "[clip8envokeOperation] Encountered invalid line arrow combination (b).";
                    break;
                default:        throw "[clip8envokeOperation] Encountered invalid line direction (a)."; break;
            }
        }
        else
            throw "Could not decode instruction X"+instr1;
        if (debug) console.log("clip8envokeOperation: remove instr1, sel1", instr1, sel1);
        svgroot.removeChild(instr1);
        svgroot.removeChild(sel1);
        tracesvgroot.appendChild(instr1);
        tracesvgroot.appendChild(sel1);
        /* FIXME: see fix above.
        if (debug) console.log("clip8envokeOperation: remove instr2, sel2", instr2, sel2);
        svgroot.removeChild(instr2);
        svgroot.removeChild(sel2);
        tracesvgroot.appendChild(instr2);
        tracesvgroot.appendChild(sel2);
        */
        if (terminate) Clip8.clearExecTimer();
    },

    envokeOperation: function () {
        var debug = true;
        var svgroot = document.getElementById("clip8svgroot");
        console.log("clip8envokeOperation:", svgroot);
        if (!(svgroot instanceof SVGElement)) { throw "[clip8] no SVG root."; }

        svgdom_setSVGNS(svgroot.namespaceURI);

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
