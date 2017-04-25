/*
    clip_8 interpreter; iconic language for paper-inspired operations.
    Copyright (C) 2016, 2017  Martin Brösamle

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


"use strict";

// drawing precision tolerances
var epsilon = 0.25;      // maximal difference for two coordinates to be considered equal
var minlen = 0.5;        // minimal size of a graphics element to be "meaningful"

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
    CIRCLE_CENTRE_TOLERANCE_RATIO: 1/5.0,
    STROKE_TOLERANCE_RATIO: 1/5.0,
    PATH_MIN_DETAIL_RATIO: .7,      // `stroke-width` times `PATH_MIN_DETAIL_RATIO`
                                    // is the minimal size for a meaningful detail
                                    // (arrow, control flow continuation etc.)
    RETRIEVE_CPOINT_MAXNUM: 10,     // number of control points considered in ISC retrieval
    // Variables
    maxcycles: 1000,
    cyclescounter: 0,
    exectimer: undefined,
    svgroot: undefined,
    ip: undefined,             // instruction pointer
    pminus1_point: undefined,  // p0 of former round
    blocklist: [],             // lements retrieved during current round
    visualiseIP: false,          // visualise processing activity to the user
    highlighted: [],           // elements highlighted for visualization

    _deriveToleranceFromElementStroke: function (el) {
        var tolerance = el.getAttribute("stroke-width") * Clip8.STROKE_TOLERANCE_RATIO;
        if (! tolerance) {
            console.warn("Could not derive tolerance from stroke width.", el);
            tolerance = 1.0 * Clip8.STROKE_TOLERANCE_RATIO;
        }
        return tolerance;
    },

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

    _highlightElement: function(el) {
        Clip8._hightlightElementColour(el, "#fff");
    },

    _hightlightElementColour: function(el, colourtag) {
        var old = el.getAttribute("stroke");
        el.setAttribute("stroke",  colourtag);
        Clip8.highlighted.push({el: el, origstroke: old});
    },

    _clearHighlight: function() {
        for (var i = 0; i < Clip8.highlighted.length; i++) {
            Clip8.highlighted[i].el.setAttribute("stroke", Clip8.highlighted[i].origstroke);
        }
    },

    retrieveISCElements: function (p, tagsI, tagsS, tagsC) {
        var debug = false;
        if (debug) console.log("[RETRIEVEISCELEMENTS] location p:", p);
        var I = [];
        var S = [];
        var C = [];
        for ( var i = 0; i < tagsI.length; i++ ) {
            I.push(Svgretrieve.getISCbyLocation(
                       p,
                       Clip8.STROKE_TOLERANCE_RATIO,
                       Clip8.RETRIEVE_CPOINT_MAXNUM,
                       [tagsI[i]],
                       Svgretrieve.I_collection));
            I[i] = I[i].filter( function(el) { return !Clip8._isBlocklisted(el) } );
            I[i].forEach( function (el) { Clip8.blocklist.push(el) } );
        }
        for ( var i = 0; i < tagsS.length; i++ ) {
            S.push(Svgretrieve.getISCbyLocation(
                       p,
                       Clip8.STROKE_TOLERANCE_RATIO,
                       Clip8.RETRIEVE_CPOINT_MAXNUM,
                       [tagsS[i]],
                       Svgretrieve.S_collection));
            S[i] = S[i].filter( function(el) { return !Clip8._isBlocklisted(el) } );
            S[i].forEach( function (el) { Clip8.blocklist.push(el) } );
        }
        for ( var i = 0; i < tagsC.length; i++ ) {
            C.push(Svgretrieve.getISCbyLocation(
                       p,
                       Clip8.STROKE_TOLERANCE_RATIO,
                       Clip8.RETRIEVE_CPOINT_MAXNUM,
                       [tagsC[i]],
                       Svgretrieve.C_collection));
            C[i] = C[i].filter( function(el) { return !Clip8._isBlocklisted(el) } );
            C[i].forEach( function (el) { Clip8.blocklist.push(el) } );
        }
        return [I, S, C];
    },

    retrieveCoreSelector: function (S, point) {
        var debug = false;
        if (debug) console.log("[RETRIEVECORESELECTOR] S:", S);
        var coreS;
        if (S[Clip8.LINETAG].length == 1) {
            // there is a selector
            var lineend = Svgdom.getBothEndsOfLine_arranged(point, S[Clip8.LINETAG][0])[1];
            var isc = Clip8.retrieveISCElements(lineend, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
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

    selectedElementSet: function (selectorcore) {
        /** Determine the set of selected elements based on given selector core.
         *  `selectorcore` is the list of SVG DOM elments being the core selector
         *  (excluding connectors). Typically these elements graphically depict an area.
         *  Return value is a list of SVG DOM elements that are selected by the given selector.
         */

        var debug = true;
        if (debug) console.log("[SELECTEDELEMENTSET] selectorcore:", selectorcore);
        // List of selected Elements based on primary selector
        var hitlist;
        var s; // The rectangle to be used as area of selection
        if (selectorcore[0] instanceof SVGRectElement) {
            // rectangle
            var dashes = selectorcore[0].getAttribute("stroke-dasharray").split(",").map(parseFloat);
            s = selectorcore[0]
        }
        else if (selectorcore[0] instanceof SVGLineElement && selectorcore[1] instanceof SVGLineElement) {
            // DELETE: X icon defines the selection area
            var dashes = selectorcore[0].getAttribute("stroke-dasharray").split(",").map(parseFloat);
            var x1 = parseFloat(selectorcore[0].getAttribute("x1"));
            var y1 = parseFloat(selectorcore[0].getAttribute("y1"));
            var x2 = parseFloat(selectorcore[0].getAttribute("x2"));
            var y2 = parseFloat(selectorcore[0].getAttribute("y2"));
            s = Svgdom.newRectElement_fromSVGRect(Svgdom.newSVGRect_fromPoints(
                {x: x1, y: y1},
                {x: x2, y: y2} ) );
        }
        else
        {
            if (debug) console.log("[selectedElementSet] UNKNOWN SELECTOR, returning undefined.");
            return undefined;
        }
        if (debug) console.log("[selectedElementSet] selector from selectorcore:", s);
        if (dashes.length == 2 && dashes[0] < dashes[1] )
            hitlist = Svgretrieve.getEnclosedRectangles(s);
        else if (dashes.length == 2 && dashes[0] > dashes[1] )
            hitlist = Svgretrieve.getIntersectingRectangles(s);
        else throw "[selectedElementSet] invalid dash pattern."

        return hitlist;
    },

    // Constants
    TERMINATE: 0,
    CONTINUE: 1,
    EXECUTE: 2,
    moveIP: function (C, p0) {
        var debug = false;
        var epsilon = 0.01;
        if ( C[Clip8.CIRCLETAG].length == 2 )
            return Clip8.TERMINATE;
        else if (C[Clip8.PATHTAG].length == 1) {
            Clip8.ip = C[Clip8.PATHTAG][0];   // move instruction pointer
            Clip8.pminus1_point = p0;         // indicate old instruction pointer
        }
        else if (C[Clip8.POLYLINETAG].length == 1) {
            if (debug) console.log("[moveIP] polyline.");
            var points = Svgdom.getPointsOfPoly(C[Clip8.POLYLINETAG][0]);
            if ( Svgdom.euclidDistance(p0, points[1]) < epsilon ) {
                // Alternative
                console.log("ALTERNATIVE");
                var endpoints = [points[0], points[2]];
                if (debug) console.log("[moveIP] endpoints:", endpoints);
                var pointA = endpoints[0];
                var localISCa = Clip8.retrieveISCElements(
                                    endpoints[0],
                                    Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                var pointB = endpoints[1];
                var localISCb = Clip8.retrieveISCElements(
                                    endpoints[1],
                                    Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                var condISC;            // the ISC where the condition is attached
                var oppositeISC;        // the ISC opposite to where the condition is attached
                var condpoint;          // the point where the condition is attached
                var oppositepoint;      // the point opposite to where the condition is attached
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
                        condpoint = pointB;
                        oppositeISC = localISCa;
                        oppositepoint = pointA;
                    }
                }
                else {
                    condISC = localISCa;
                    condpoint = pointA;
                    oppositeISC = localISCb;
                    oppositepoint = pointB;
                }
                var retrselector = Clip8.retrieveCoreSelector(condISC[1], condpoint);
                var selectortype = retrselector[0];
                var coreselector = retrselector[1];
                var condselected = Clip8.selectedElementSet(coreselector);
                if (condselected.length > 0)
                    if (condISC[2][Clip8.PATHTAG].length == 1) {
                        Clip8.ip = condISC[2][Clip8.PATHTAG][0];   // move instruction pointer to cond side
                        Clip8.pminus1_point = condpoint;           // indicate old instruction pointer
                    }
                    else
                        throw "[moveIP] Invalid control flow at alternative.";
                else
                    if (oppositeISC[2][Clip8.PATHTAG].length == 1) {
                        Clip8.ip = oppositeISC[2][Clip8.PATHTAG][0];   // move instruction pointer opposite side
                        Clip8.pminus1_point = oppositepoint;           // indicate old instruction pointer
                    }
                    else
                        throw "[moveIP] Invalid control flow at alternative.";
            }
            else {
                // Merge
                console.log("MERGE");
                var localISC = Clip8.retrieveISCElements(
                                    points[1],
                                    Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                if (localISC[2][Clip8.PATHTAG].length == 1) {
                    Clip8.ip = localISC[2][Clip8.PATHTAG][0];    // move instruction pointer
                    Clip8.pminus1_point = points[1];             // indicate old instruction pointer
                }
                else
                    throw "[moveIP] Invalid control flow at merge.";
            }
            return Clip8.CONTINUE;
        } else {
            console.error("Invalid control flow, retrieved elements C at location p:", C, p0);
            throw "[moveIP] Invalid control flow.";
        }
        return Clip8.EXECUTE;
    },

    initControlFlow: function () {
        var debug = true;
        var debugcolour = false;
        var circles = Clip8.svgroot.getElementsByTagName("circle");
        var centres_offilled = [];  // Centres of filled circles (candidates).
        var radii_offilled = [];    // and their respective radius
        var initialflow = null;

        for (var i = 0, c; i < circles.length; i++) {
            if (debugcolour) circles[i].setAttribute("stroke", "#95C9EF");
            if (circles[i].getAttribute("fill", "none") != "none") {
                if (debugcolour) circles[i].setAttribute("fill", "#3EA3ED");
                centres_offilled.push(Svgdom.getCentrePoint(circles[i]));
                radii_offilled.push(Svgdom.getRadius(circles[i]));
            }
        }
        for (var i = 0; i < centres_offilled.length; i++ ) {
            var concentrics = Svgretrieve.getISCbyLocation(
                                  centres_offilled[i],
                                  radii_offilled[i]*Clip8.CIRCLE_CENTRE_TOLERANCE_RATIO,
                                  3,
                                  ['circle'],
                                  Svgretrieve.C_collection);

            if (concentrics.length == 1) {
                // found circle not surrounded by any other
                var hitlist = Svgretrieve.getISCbyLocation(
                                  centres_offilled[i],
                                  radii_offilled[i]*Clip8.CIRCLE_CENTRE_TOLERANCE_RATIO,
                                  3,
                                  ['path'],
                                  Svgretrieve.C_collection);
                if (debug) console.debug("[initControlFlow] hitlist", hitlist);
                if (!hitlist[0]) {
                    console.error("[initControlFlow] failed to identify intial path segment at", centres_offilled[i])
                    throw "[initControlFlow] failed to identify intial path segment";
                }
                if (debugcolour) hitlist[0].setAttribute("stroke", "#ED1E79");
                Clip8.pminus1_point = centres_offilled[i];
                if (Clip8.visualiseIP) Clip8._highlightElement(hitlist[0]);
                return hitlist[0];
            }
        }
        throw "Failed to idendify point of entry.";
    },

    executeOneOperation: function() {
        var debug = true;
        if (debug) console.log("[EXECUTEONEOPERATION] Clip8.ip, svgroot:", Clip8.ip);
        Clip8.cyclescounter++;
        if (Clip8.maxcycles > 0 && Clip8.cyclescounter >= Clip8.maxcycles) {
            Clip8.stopTimer();
            throw "Maximal number of cycles";
        }

        var p0candidates, p0;
        if (Clip8.ip.tagName == "path")
            p0candidates = Svgdom.getBothEndsOfPath(Clip8.ip);
        else throw "[executeOneOperation] expected path or line as ip element.";
        if ( Svgdom.euclidDistance(Clip8.pminus1_point, p0candidates[0]) < 1.0*Clip8.STROKE_TOLERANCE_RATIO )
            if ( Svgdom.euclidDistance(Clip8.pminus1_point, p0candidates[1]) > 1.0*Clip8.PATH_MIN_DETAIL_RATIO )
                p0 = p0candidates[1];
            else {
                console.error("Control flow ambiguous (both path ends are close to former p0).", Clip8.ip)
                throw "Control flow ambiguous (both path ends are close to former p0)."
            }
        else
            p0 = p0candidates[0];

        // reset the blocklist and fetch a new instruction
        Clip8.blocklist = [Clip8.ip];
        var ISC0 = Clip8.retrieveISCElements(p0, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
        var I0 = ISC0[0];
        var S0 = ISC0[1];
        var C0 = ISC0[2];
        if (debug) console.log("[executeOneOperation] I0:", I0.reduce(function(a,b) {return a.concat(b)}));
        if (debug) console.log("[executeOneOperation] S0:", S0.reduce(function(a,b) {return a.concat(b)}));
        if (debug) console.log("[executeOneOperation] C0:", C0.reduce(function(a,b) {return a.concat(b)}));
        if (Clip8.visualiseIP) {
            Clip8._clearHighlight();
            for (var i = 0; i < I0.length; i++) {
                for (var j = 0; j < I0[i].length; j++)
                    Clip8._highlightElement(I0[i][j]);
            }
            for (var i = 0; i < S0.length; i++) {
                for (var j = 0; j < S0[i].length; j++)
                    Clip8._highlightElement(S0[i][j]);
            }
            for (var i = 0; i < C0.length; i++) {
                for (var j = 0; j < C0[i].length; j++)
                    Clip8._highlightElement(C0[i][j]);
            }
        }
        var execstatus = Clip8.moveIP(C0, p0);
        switch (execstatus) {
            case Clip8.EXECUTE:
                break;      // redundant but more readable.
            case Clip8.CONTINUE:
                return;     // without any instruction execution in this cycle
            case Clip8.TERMINATE:
                Clip8.stopTimer();
                return;     // stop execution
        }
        var retrselector = Clip8.retrieveCoreSelector(S0, p0)
        var selectortype = retrselector[0];
        var coreselector = retrselector[1];
        if      (selectortype == Clip8.RECTSELECTOR)
            var selectedelements1 = Clip8.selectedElementSet(coreselector);
        else if (selectortype == Clip8.UNKNOWNSELECTOR)
            {}
        else
            throw "received an invalid selectortype from retrieveCoreSelector: "+selectortype;
        if (debug) console.log("[executeOneOperation] selectedelements1:", selectedelements1);


        if (I0[Clip8.LINETAG].length == 1) {
            // ALIGN, CUT, MOVE-REL, CLONE, DEL
            var theline = I0[Clip8.LINETAG][0];
            var bothends = Svgdom.getBothEndsOfLine_arranged(p0, theline);
            if (debug) console.log("[executeOneOperation] theline:", theline);
            if (I0[Clip8.POLYLINETAG].length == 1) {
                // ALIGN
                if (debug) console.log("[executeOneOperation] 1 line, 1 polyline.");
                var linedir = Clip8decode.directionOfSVGLine(theline, epsilon, minlen);
                if (debug) console.log("[executeOneOperation] direction:", linedir);
                var thepoly = I0[Clip8.POLYLINETAG][0];
                var angledir = Clip8decode.directionOfPolyAngle(thepoly, epsilon, minlen);
                if (debug) console.log("[executeOneOperation] angle direction:", angledir);
                var ISC1 = Clip8.retrieveISCElements(bothends[1], Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                var I1 = ISC1[0];
                var S1 = ISC1[1];
                if (debug) console.log("[executeOneOperation] I1:", I1.reduce(function(a,b) {return a.concat(b)}));
                if (debug) console.log("[executeOneOperation] S1:", S1.reduce(function(a,b) {return a.concat(b)}));
                for (var i=0; i<selectedelements1.length; i++)
                    Svgretrieve.unregisterRectElement(selectedelements1[i]);
                if (I1[Clip8.RECTTAG].length == 1 )
                    selectedelements1.push(I1[Clip8.RECTTAG][0]); // Add the absolute rectangle to the selected set.
                switch (linedir) {
                    case 'UP':
                    case 'DOWN':
                        if (angledir == 'LEFT')         Paperclip.alignrelLeft (selectedelements1);
                        else if (angledir == 'RIGHT')   Paperclip.alignrelRight (selectedelements1);
                        else if (angledir == 'DOWN') {
                            var deltaX, deltaY;
                            var distanceY = Math.abs(bothends[1].y-bothends[0].y);
                            Paperclip.shrinkFromTop (selectedelements1, distanceY);
                        }
                        else throw "[executeOneOperation] Encountered invalid line arrow combination (a).";
                        break;
                    case 'LEFT':
                    case 'RIGHT':
                        if (angledir == 'UP')           Paperclip.alignrelTop (selectedelements1);
                        else if (angledir == 'DOWN')    Paperclip.alignrelBottom (selectedelements1);
                        else throw "[executeOneOperation] Encountered invalid line arrow combination (b).";
                        break;
                    default:
                        console.error("Invalid line direction in ALIGN OPERATION: ", theline);
                        break;
                }
                if (I1[Clip8.RECTTAG].length == 1 )
                    selectedelements1.pop(); // Remove the absolute rectangle from the selected set.
                for (var i=0; i<selectedelements1.length; i++)
                    Svgretrieve.registerRectElement(selectedelements1[i]);
            }
            else if (I0[Clip8.POLYLINETAG].length == 0 && I0[Clip8.RECTTAG].length == 0) {
                // MOVE-REL, CUT, DEL
                if (theline.getAttribute("stroke-dasharray")) {
                    if (debug) console.log("one dashed line.");
                    // CUT, DEL
                    var linedir = Clip8decode.directionOfSVGLine(theline, epsilon, minlen);
                    var newelements;
                    switch (linedir) {
                        case 'UP':
                        case 'DOWN':

                            break;
                        case 'LEFT':
                        case 'RIGHT':
                            // CUT
                            var stripeNaboveNbelow = Svgretrieve.enclosingFullHeightStripe(theline);
                            var stripe = stripeNaboveNbelow[0];
                            var above = stripeNaboveNbelow[1];
                            var below = stripeNaboveNbelow[2];

                            if (debug) console.log("[executeOneOperation] stripe, above, below:", stripe, above, below);
                            var hitlist = Svgretrieve.getEnclosedRectangles(Svgdom.newRectElement_fromSVGRect(stripe));
                            if (debug) console.log("[executeOneOperation] hitlist:", hitlist);
                            var selectedelements1 = []
                            for (var i = 0; i < hitlist.length; i++)
                                if ( Svgdom.intersectsRectRectelement(above, hitlist[i]) &&
                                     Svgdom.intersectsRectRectelement(below, hitlist[i]) )
                                    selectedelements1.push(hitlist[i]);

                            if (debug) console.log("[executeOneOperation] selectedelements1:", selectedelements1);
                            newelements = Paperclip.cutHorizontal(selectedelements1, theline.getAttribute("y1"));
                            for (var i=0; i<newelements.length; i++)
                                Svgretrieve.registerRectElement(newelements[i]);
                            break;
                        case 'UP-RE':
                        case 'UP-LE':
                        case 'DO-RE':
                        case 'DO-LE':
                            // DEL
                            var p3, p4, opposite_diagonals, selectedelements1, tolerance;
                            p3 = Clip8.svgroot.createSVGPoint();
                            p4 = Clip8.svgroot.createSVGPoint();
                            p3.x = theline.getAttribute("x1");
                            p3.y = theline.getAttribute("y2");
                            p4.x = theline.getAttribute("x2");
                            p4.y = theline.getAttribute("y1");
                            tolerance = Clip8._deriveToleranceFromElementStroke(theline);
                            opposite_diagonals = Svgretrieve.getLinesFromTo(
                                                     p3, p4,
                                                     tolerance,
                                                     Clip8.RETRIEVE_CPOINT_MAXNUM,
                                                     Svgretrieve.I_collection);
                            if (debug) console.log("[executeOneOperation] opposite_diagonals:", opposite_diagonals);
                            if (opposite_diagonals.length != 1) {
                                console.error("Ambiguous diagonals in (delete ?) instruction.",
                                              opposite_diagonals )
                                throw "[executeOneOperation / del] Ambiguous diagonals.";
                            }
                            selectedelements1 = Clip8.selectedElementSet([theline, opposite_diagonals[0]]);
                            for (var i = 0; i < selectedelements1.length; i++)
                                selectedelements1[i].parentElement.removeChild(selectedelements1[i]);
                            break;
                        default:
                            throw "[executeOneOperation] Encountered invalid line direction (b).";
                            break;
                    }
                }
                else {
                    // MOVE-REL
                    var tolerance = Clip8._deriveToleranceFromElementStroke(theline);
                    var deltaX, deltaY;
                    deltaX = bothends[1].x-bothends[0].x;
                    deltaY = bothends[1].y-bothends[0].y;
                    for (var i=0; i<selectedelements1.length; i++)
                        Svgretrieve.unregisterRectElement(selectedelements1[i]);
                    Paperclip.moveBy(selectedelements1, deltaX, deltaY);
                    for (var i=0; i<selectedelements1.length; i++)
                        Svgretrieve.registerRectElement(selectedelements1[i]);
                }
            }
            else if (I0[Clip8.RECTTAG].length == 1) {
                // CLONE
                var newelements;
                if (debug) console.log("[executeOneOperation/clone]");
                var deltaX, deltaY;
                deltaX = bothends[1].x-bothends[0].x;
                deltaY = bothends[1].y-bothends[0].y;
                newelements = Paperclip.clone_moveBy(selectedelements1, deltaX, deltaY);
                for (var i=0; i<newelements.length; i++)
                    Svgretrieve.registerRectElement(newelements[i]);
            }
        }
        else
            throw "Could not decode instruction X";
    },

    init: function (svgroot, visualiseIP, highlightErr, highlightSyntax) {
        console.log("[clip8.init]", svgroot);
        if (!(svgroot instanceof SVGElement)) { throw "[clip8] no SVG root."; }
        Clip8.visualiseIP = visualiseIP;
        Svgdom.init(svgroot);
        Svgretrieve.init(svgroot, highlightErr, highlightErr, Clip8._hightlightElementColour);
        Clip8.stopTimer();
        Clip8.cyclescounter = 0
        Clip8.svgroot = svgroot;
        Clip8.ip = Clip8.initControlFlow();     // instruction pointer: the active control flow path
        return svgroot;
    },

    startTimer: function () {
        Clip8.exectimer = setInterval( function() { Clip8.executeOneOperation() }, 50 );
    },

    stopTimer: function () {
        if (Clip8.exectimer)
            clearInterval(Clip8.exectimer);
    }
};

var Clip8controler = {
    svgroot: null,
    initialised: false,

    init: function (svgroot, visualiseIP, highlightErr, highlightSyntax) {
        console.log("[INIT] svgroot, visualiseIP, highlightErr, highlightSyntax", svgroot, visualiseIP, highlightErr, highlightSyntax);
        Clip8controler.svgroot;
        Clip8.init(svgroot, visualiseIP, highlightErr, highlightSyntax);
    },

    testRun: function (maxcycles) {
        console.log("TEST-RUN: maxcycles:", maxcycles);
        Clip8.maxcycles = maxcycles;
        Clip8.startTimer();
    },

    playAction: function () {
        console.log("PLAY clip_8");
        Clip8.maxcycles = 0;
        Clip8.startTimer();
        Clip8controler.initialised = true;
    },

    pauseAction: function () {
        console.log("not implemented: PAUSE clip_8");
        Clip8.stopTimer();
    },

    stepAction: function () {
        console.log("STEP clip_8");
        Clip8.executeOneOperation(Clip8controler.svgroot);
    }
}
