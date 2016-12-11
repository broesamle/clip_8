"use strict";

// drawing precision tolerances
var epsilon = 0.5;  // maximal difference for two coordinates to be considered equal
var minlen = 1.5;     // minimal size of a graphics element to be "meaningful"

var Clip8 = {
    // Constants
    TAGS: ["line", "polyline", "circle", "rect", "path"],
    LINETAG: 0,
    POLYLINETAG: 1,
    CIRCLETAG: 2,
    RECTTAG: 3,
    PATHTAG: 4,
    UNKNOWNSELECTOR: 900,
    RECTSELECTOR: 901,
    // Variables
    exectimer: null,
    ip: null,           // instruction pointer
    pminus1_area: null, // p0area of former round.
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
        Clip8.pminus1_area = initarea;
        for ( var i = 0; i < hitlist.length; i++ )
            if (hitlist[i].tagName == "path") return hitlist[i];
        throw "Failed to idendify point of entry."
    },

    retrieveISCElements: function (arearect, svgroot, tagsI, tagsS, tagsC) {
        var debug = false;
        if (debug) console.log("[RETRIEVEISCELEMENTS] arearect, svgroot:", arearect, svgroot);
        var hitlist = svgroot.getIntersectionList(arearect, svgroot);
        if (debug)  console.log("[retrieveISCElements] hitlist:", hitlist);
        if (hitlist.length == 0) throw "[retrieveISCElements] empty hitlist.";
        var I = [];
        var S = [];
        var C = [];
        for ( var i = 0; i < tagsI.length; i++ ) I.push([]);
        for ( var i = 0; i < tagsS.length; i++ ) S.push([]);
        for ( var i = 0; i < tagsC.length; i++ ) C.push([]);
        for ( var i = 0; i < hitlist.length; i++ ) {
            if (!Clip8._isBlocklisted(hitlist[i])) {
                if (hitlist[i].getAttribute("stroke-linecap") == "round") {
                    I = Clip8decode.pushByTagname(hitlist[i], tagsI, I);
                    Clip8.blocklist.push(hitlist[i]);
                }
                else if (hitlist[i].getAttribute("stroke-dasharray") &&
                    (hitlist[i].tagName == "rect" || hitlist[i].tagName == "line") ) {
                    S = Clip8decode.pushByTagname(hitlist[i], tagsS, S);
                    Clip8.blocklist.push(hitlist[i]);
                }
                else if ( hitlist[i].getAttribute("stroke-linecap") != "round" &&
                    (hitlist[i].tagName == "path" ||
                     hitlist[i].tagName == "circle" ||
                     hitlist[i].tagName == "polyline") ) {
                    C = Clip8decode.pushByTagname(hitlist[i], tagsC, C);
                    Clip8.blocklist.push(hitlist[i]);
                }
                else throw "[retrieveISCElements] UGO, unknownd graphics object: "+hitlist[i];
            }
            else
                if (debug) console.log("[retrieveISCElements] ignore blocklisted element:", Clip8._isBlocklisted(hitlist[i]) );
        }
        return [I, S, C];
    },

    // Constants
    TERMINATE: 0,
    CONTINUE: 1,
    EXECUTE: 2,
    moveIP: function (C, arearect, svgroot) {
        var debug = true;
        var epsilon = 0.01;
        if ( C[Clip8.CIRCLETAG].length == 2 )
            return Clip8.TERMINATE;
        else if      (C[Clip8.PATHTAG].length == 1)
            Clip8.ip = C[Clip8.PATHTAG][0];   // move instruction pointer
        else if (C[Clip8.POLYLINETAG].length == 1) {
            if (debug) console.log("[moveIP] polyline.");
            var points = Svgdom.getPointsOfPoly(C[Clip8.POLYLINETAG][0]);
            if (Svgdom.enclosesRectPoint(arearect, points[1])) {
                // Alternative
                var endpoints = [points[0], points[2]];
                if (debug) console.log("[moveIP] endpoints:", endpoints);
                var localISCa = Clip8.retrieveISCElements(
                                    Svgdom.epsilonRectAt(endpoints[0], epsilon, svgroot),
                                    svgroot, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                var localISCb = Clip8.retrieveISCElements(
                                    Svgdom.epsilonRectAt(endpoints[1], epsilon, svgroot),
                                    svgroot, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                if (localISCa[1][Clip8.LINETAG].length == 0 && localISCa[1][Clip8.RECTTAG].length == 0) {
                    // no selector at this end
                    if (localISCb[1][Clip8.LINETAG].length == 0 && localISCb[1][Clip8.RECTTAG].length == 0)
                        // no selector at the other end
                        throw "[moveIP] Alternative without selector.";
                    else {
                        endpoints = endpoints.reverse();
                        var localISCtemp = localISCa;
                        localISCa = localISCb;
                        localISCb = localISCtemp;
                    }
                }
                if (debug) console.log("[moveIP] localISC a,b:", localISCa, localISCb);
                if (localISCb[2][Clip8.PATHTAG].length == 1)
                    Clip8.ip = localISCb[2][Clip8.PATHTAG][0];   // move instruction pointer
                else
                    throw "[moveIP] Invalid control flow at alternative.";
            }
            else {
                // Merge
                var localISC = Clip8.retrieveISCElements(
                                    Svgdom.epsilonRectAt(points[1], epsilon, svgroot),
                                    svgroot, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                if (localISC[2][Clip8.PATHTAG].length == 1)
                    Clip8.ip = localISC[Clip8.PATHTAG][0];   // move instruction pointer
                else
                    throw "[moveIP] Invalid control flow at merge.";
            }
            return Clip8.CONTINUE;
        }
        else
            throw "[moveIP] Invalid control flow.";
        return Clip8.EXECUTE;
    },

    retrieveCoreSelector: function (S, svgroot) {
        var debug = true;
        if (debug) console.log("[RETRIEVECORESELECTOR] S, svgroot:", S, svgroot);
        var coreS;
        if (S[Clip8.LINETAG].length == 1) {
            // there is a selector
            var epsilon = 0.01;
            var arearect = Svgdom.epsilonRectAt(Svgdom.getEndOfLinePoint(S[Clip8.LINETAG][0]), epsilon, svgroot);
            var isc = Clip8.retrieveISCElements(arearect, svgroot, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
            if (debug) console.log("[retrieveCoreSelector] local isc [0, 1, 2]:", isc[0], isc[1], isc[2]);
            coreS = isc[1];
        }
        else {
            coreS = S;
        }
        if (debug) console.log("[retrieveCoreSelector] coreS:", coreS);
        if (debug) console.log("[retrieveCoreSelector] coreS[Clip8.RECTTAG].length:", coreS[Clip8.RECTTAG].length);
        if      (coreS[Clip8.RECTTAG].length == 1)
            return [Clip8.RECTSELECTOR, coreS[Clip8.RECTTAG]];
        else
            return [Clip8.UNKNOWNSELECTOR];
    },

    selectedElementSet: function (selectorcore, svgroot) {
        /** Determine the set of selected elements based on given selector core.
         *  `selectorcore` is the list of SVG DOM elments being the core selector
         *  (excluding connectors). Typically these elements graphically depict an area.
         *  Return value is a list of SVG DOM elements that are selected by the given selector.
         */

        var debug = false;
        if (debug) console.log("[SELECTEDELEMENTSET] arearect:", selectorcore, svgroot);

        // List of selected Elements based on primary selector
        var selection = [];
        if (selectorcore[0] instanceof SVGRectElement) {
            var s = Svgretrieve.selectorFromRect(selectorcore[0], svgroot);
            if (debug) console.log("[selectedElementSet] selector from rect in selectorcore:", s);
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
        if (debug) console.log("[EXECUTEONEOPERATION] Clip8.ip, svgroot, tracesvgroot:", Clip8.ip, svgroot, tracesvgroot);
        if (Clip8.ip.tagName != "path") throw "[executeOneOperation] ip element is not a path.";

        var p0candidates = Svgdom.getBothEndsOfPath(Clip8.ip);
        var p0;
        if ( Svgdom.enclosesRectPoint(Clip8.pminus1_area, p0candidates[0]) )
            if ( Svgdom.enclosesRectPoint(Clip8.pminus1_area, p0candidates[1]) )
                throw "Control flow ambiguous/both path ends close to former p0."
            else
                p0 = p0candidates[1];
        else
            p0 = p0candidates[0];
        var p0area = Svgdom.epsilonRectAt(p0, epsilon, svgroot);
        // reset the blocklist and fetch a new instruction
        Clip8.blocklist = [Clip8.ip];
        var ISC0 = Clip8.retrieveISCElements(p0area, svgroot, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
        if (debug) console.log("[executeOneOperation] ISC0 [0, 1, 2]:", ISC0[0], ISC0[1], ISC0[2]);
        var I0 = ISC0[0];
        var S0 = ISC0[1];
        var C0 = ISC0[2];
        var execstatus = Clip8.moveIP(C0, p0area, svgroot);
        Clip8.pminus1_area = p0area;    // indicate old instruction pointer area
        switch (execstatus) {
            case Clip8.EXECUTE:
                break;      // redundant but more readable.
            case Clip8.CONTINUE:
                return;     // without any instruction execution in this cycle
            case Clip8.TERMINATE:
                Clip8.clearExecTimer();
                return;     // stop execution
        }
        if (debug) console.log("[executeOneOperation] S0:", S0);
        var retrselector = Clip8.retrieveCoreSelector(S0, svgroot)
        var selectortype = retrselector[0];
        var coreselector = retrselector[1];
        if      (selectortype == Clip8.RECTSELECTOR)
            var selectedelements1 = Clip8.selectedElementSet(coreselector, svgroot);
        else if (selectortype == Clip8.UNKNOWNSELECTOR)
            {}
        else
            throw "received an invalid selectortype from retrieveCoreSelector: "+selectortype;
        if (debug) console.log("[executeOneOperation] selectedelements1:", selectedelements1);

        if ( I0[Clip8.LINETAG].length == 1 && I0[Clip8.POLYLINETAG].length == 1 ) {
            // ALIGN
            if (debug) console.log("[executeOneOperation] 1 line, 1 polyline.");
            var theline = I0[Clip8.LINETAG][0];
            var linedir = Clip8decode.directionOfSVGLine(theline, epsilon, minlen);
            if (debug) console.log("[executeOneOperation] direction:", linedir);
            var thepoly = I0[Clip8.POLYLINETAG][0];
            var angledir = Clip8decode.directionOfPolyAngle(thepoly, epsilon, minlen);
            if (debug) console.log("[executeOneOperation] angle direction:", angledir);
            var arearect = Svgdom.epsilonRectAt(Svgdom.getEndOfLinePoint(theline), epsilon, svgroot);
            var ISC1 = Clip8.retrieveISCElements(arearect, svgroot, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
            if (debug) console.log("[executeOneOperation] ISC1 [0, 1, 2]:", ISC1[0], ISC1[1], ISC1[2]);
            var I1 = ISC1[0];
            var S1 = ISC1[1];
            if (I1[Clip8.RECTTAG].length == 1 )
                selectedelements1.push(I1[Clip8.RECTTAG][0]); // Add the absolute rectangle to the selected set.
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
        }
        else if ( I0[Clip8.LINETAG].length == 1 && I0[Clip8.POLYLINETAG].length == 0 ) {
            // MOVE-REL, CUT
            if (debug) console.log("[executeOneOperation] 1 line.");
            var theline = I0[Clip8.LINETAG][0];
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
            throw "Could not decode instruction X";
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
