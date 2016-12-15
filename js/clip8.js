"use strict";

// drawing precision tolerances
var epsilon = 0.5;      // maximal difference for two coordinates to be considered equal
var minlen = 1.5;       // minimal size of a graphics element to be "meaningful"

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
    maxcycles: 10,
    cyclescounter: 0,
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

    removeFalsePositives: function (arearect, hitlist)  {
        /** In the ISC components intersection is too weak as a criterion.
         *  Reduce the `hitlist` so ad to keep only those objects with
         *  one of the attachment points (end, corner, ...)
         *  enclosed by `arearect`.
         */
        var points;         // points to check for the current element
        var result = [];
        for (var i = 0; i < hitlist.length; i++) {
            var el = hitlist[i];
            if (el instanceof SVGRectElement)
                points = Svgdom.getCornersOfRectPoints(el)
            else if (el instanceof SVGPathElement) {
                points = Svgdom.getBothEndsOfPath(el)
            }
            else {
                result.push(el);
                continue;
            }
            for (var j = 0; j < points.length; j++) {
                if (Svgdom.enclosesRectPoint(arearect, points[j])) {
                    result.push(el);
                    break;
                }
            }
        }
        return result;
    },

    retrieveISCElements: function (arearect, svgroot, tagsI, tagsS, tagsC) {
        var debug = false;
        if (debug) console.log("[RETRIEVEISCELEMENTS] arearect, svgroot:", arearect, svgroot);
        var hitlist = svgroot.getIntersectionList(arearect, svgroot);
        if (debug)  console.log("[retrieveISCElements] hitlist:", hitlist);
        hitlist = Clip8.removeFalsePositives(arearect, hitlist);
        if (debug)  console.log("[retrieveISCElements] hitlist (red):", hitlist);
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

    retrieveCoreSelector: function (S, svgroot) {
        var debug = false;
        if (debug) console.log("[RETRIEVECORESELECTOR] S, svgroot:", S, svgroot);
        var coreS;
        if (S[Clip8.LINETAG].length == 1) {
            // there is a selector
            var epsilon = 0.01;
            var arearect = Svgdom.epsilonRectAt(Svgdom.getEndPointsOfLine(S[Clip8.LINETAG][0])[1], epsilon, svgroot);
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

        // Constants
    TERMINATE: 0,
    CONTINUE: 1,
    EXECUTE: 2,
    moveIP: function (C, arearect, svgroot) {
        var debug = true;
        var epsilon = 0.01;
        if ( C[Clip8.CIRCLETAG].length == 2 )
            return Clip8.TERMINATE;
        else if (C[Clip8.PATHTAG].length == 1)
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
                var condISC;        // the ISC where the condition is attached
                var oppositeISC;    // the ISC opposite to where the condition is attached
                // Determine the side whith an attached selector.
                // We will call this side `cond` and the other side `opposite`
                if (localISCa[1][Clip8.LINETAG].length == 0 && localISCa[1][Clip8.RECTTAG].length == 0) {
                    // no selector at this end
                    if (localISCb[1][Clip8.LINETAG].length == 0 && localISCb[1][Clip8.RECTTAG].length == 0)
                        // no selector at the other end
                        throw "[moveIP] Alternative without selector.";
                    else {
                        endpoints = endpoints.reverse();
                        var localISCtemp = localISCa;
                        condISC = localISCb;
                        oppositeISC = localISCa;
                    }
                }
                else {
                    condISC = localISCa;
                    oppositeISC = localISCb;
                }
                var retrselector = Clip8.retrieveCoreSelector(condISC[1], svgroot);
                var selectortype = retrselector[0];
                var coreselector = retrselector[1];
                var condselected = Clip8.selectedElementSet(coreselector, svgroot);
                if (condselected.length > 0)
                    if (condISC[2][Clip8.PATHTAG].length == 1)
                        Clip8.ip = condISC[2][Clip8.PATHTAG][0];   // move instruction pointer to cond side
                    else
                        throw "[moveIP] Invalid control flow at alternative.";
                else
                    if (oppositeISC[2][Clip8.PATHTAG].length == 1)
                        Clip8.ip = oppositeISC[2][Clip8.PATHTAG][0];   // move instruction pointer opposite side
                    else
                        throw "[moveIP] Invalid control flow at alternative.";
            }
            else {
                // Merge
                var localISC = Clip8.retrieveISCElements(
                                    Svgdom.epsilonRectAt(points[1], epsilon, svgroot),
                                    svgroot, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                if (localISC[2][Clip8.PATHTAG].length == 1)
                    Clip8.ip = localISC[2][Clip8.PATHTAG][0];   // move instruction pointer
                else
                    throw "[moveIP] Invalid control flow at merge.";
            }
            return Clip8.CONTINUE;
        }
        else
            throw "[moveIP] Invalid control flow.";
        return Clip8.EXECUTE;
    },

    initControlFlow: function (svgroot, tracesvgroot) {
        var debug = false;
        var debugcolour = false;
        var circles = svgroot.getElementsByTagName("circle");
        var centres_offilled = [];  // Centres of filled circles (candidates).
        var centrareas = [];        // Epsilon rectangles arount each circle centre.
        var initialflow = null;

        for (var i = 0, c; i < circles.length; i++) {
            if (debugcolour) circles[i].setAttribute("stroke", "#95C9EF");
            c = Svgdom.getCentrePoint(circles[i]);
            centrareas.push ( Svgdom.epsilonRectAt(c, epsilon, svgroot) );
            if (circles[i].getAttribute("fill", "none") != "none") {
                if (debugcolour) circles[i].setAttribute("fill", "#3EA3ED");
                centres_offilled.push(c);
            }
        }
        for (var i = 0; i < centres_offilled.length; i++ ) {
            var hitcount = 0, lasthit = 0;
            for (var j = 0; j < centrareas.length; j++ ) {
                if (Svgdom.enclosesRectPoint(centrareas[j], centres_offilled[i])) {
                    hitcount++;
                }
                if (hitcount > 1) break;
            }
            if (hitcount == 1) {
                // found circle not surrounded by any other (= an area being the centre of one circle).
                var hit = centres_offilled[i];
                var hitarea = Svgdom.epsilonRectAt(hit, epsilon, svgroot);
                var hitlist = svgroot.getIntersectionList(hitarea, svgroot);
                if (debug) console.log("[initControlFlow] , hit, hitarea, hitlist:", hit, hitarea, hitlist);
                for ( var k = 0; k < hitlist.length; k++ ) {
                    if (hitlist[k].tagName == "path") {
                        if (debugcolour)hitlist[k].setAttribute("stroke", "#ED1E79");
                        Clip8.pminus1_area = hitarea;
                        return hitlist[k];
                    }
                }
            }
        }
        throw "Failed to idendify point of entry."
    },

    executeOneOperation: function(svgroot) {
        var debug = true;
        if (debug) console.log("[EXECUTEONEOPERATION] Clip8.ip, svgroot, tracesvgroot:", Clip8.ip, svgroot);
        Clip8.cyclescounter++;
        if (Clip8.cyclescounter >= Clip8.maxcycles) {
            Clip8.clearExecTimer();
            throw "Maximal number of cycles";
        }
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
            var arearect = Svgdom.epsilonRectAt(Svgdom.getEndPointsOfLine(theline)[1], epsilon, svgroot);
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
                var movement = Svgdom.getEndPointsOfLine(theline);
                var circles = Svgretrieve.getCirclesAt(
                    movement[1],
                    theline.getAttribute("stroke-width"),       // use as minimum radius
                    theline.getAttribute("stroke-width") * 4,   // use as minimum radius
                    svgroot);
                if (debug) console.log("[executeOneOperation/move-rel] circles:", circles);
                var deltaX, deltaY;
                deltaX = movement[1].x-movement[0].x;
                deltaY = movement[1].y-movement[0].y;
                Paperclip.moveBy(selectedelements1, deltaX, deltaY);
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
        // crucial init operations
        Svgdom.setSVGNS(svgroot.namespaceURI);
        Clip8.cyclescounter = 0

        Clip8.ip = Clip8.initControlFlow(svgroot);     // instruction pointer: the active control flow path
        Clip8.exectimer = setInterval( function() { Clip8.executeOneOperation(svgroot) }, 50 );
    },

    clearExecTimer: function () {
        clearInterval(Clip8.exectimer);
    }
};

function eraseTraceUNUSED (svgroot) {
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

function clip8setTraceAttribsUNUSED(el) {
    el.setAttribute("stroke", "#88aaff");
    el.setAttribute("stroke-width", "1");
    el.setAttribute("fill", "none");
    el.setAttribute("pointer-events", "none");
}

function startAction() {
    var svgroot = document.getElementById("clip8svgroot");
    console.log("STARTING clip_8", svgroot);
    Clip8.envokeOperation();
}
