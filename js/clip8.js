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
    INTERNAL_ERROR_HINT: "This is an internal error and should never happen. Consider filing and issue. Your contribution is appreciated!",
    // Execution status constants
    TERMINATE: 0,
    CONTINUE: 1,
    EXECUTE: 2,
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
    svgroot: undefined,
    ip: undefined,                  // instruction pointer: the active control flow path
    pminus1_point: undefined,       // p0 of former round
    blocklist: [],                  // elements retrieved during current round
    visualiseIP: false,             // visualise processing activity to the user
    highlightErr: true,             // hightlight dom elements related to the current terror
    highlighted: [],                // elements highlighted for visualization
    _reduce: function (reduceable) {
        return reduceable.reduce( function(a,b) {return a.concat(b)} );
    },

    _deriveToleranceFromElementStroke: function (el) {
        // FIXME: clarify use of style vs attribute
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
        Clip8.highlighted.push({el: el, origstroke: el.style.getPropertyValue('stroke')});
        el.style.setProperty('stroke', colourtag);
    },

    _clearHighlight: function() {
        for (var i = 0; i < Clip8.highlighted.length; i++) {
            Clip8.highlighted[i].el.style.setProperty('stroke', Clip8.highlighted[i].origstroke);
        }
    },

    _reportError: function (source, message, errorelements=[], locations=[], hinttext="") {
        console.error("ERROR ["+source+"]:", message);
        if (!source) source = "--no source provided : / --";
        if (!message) message = "--no error message provided : / --";
        if (errorelements.length > 0) {
            console.groupCollapsed("Elements");
            for (var i=0; i<errorelements.length; i++) {
                console.error (errorelements[i]);
                if (Clip8.highlightErr)
                    Clip8._hightlightElementColour(errorelements[i], "#ff2222");
            }
            console.groupEnd();
        }
        if (locations.length > 0) {
            console.groupCollapsed("Locations");
            var locrect;
            for (var i=0; i<locations.length; i++) {
                console.error (locations[i]);
                if (Clip8.highlightErr) {
                    locrect = Svgdom.newRectElement(locations[i].x-5, locations[i].y-5, 10, 10);
                    locrect.style = "fill:none; stroke:#ee22cc; stroke-width: 1";
                    Clip8.svgroot.appendChild (locrect);
                }
            }
        }
        console.groupEnd();
        throw {'error': message, 'hint': hinttext};
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
        if (S[Clip8.LINETAG].length == 1) {
            // there is a selector
            var lineend = Svgdom.getBothEndsOfLine_arranged(point, S[Clip8.LINETAG][0])[1];
            var isc = Clip8.retrieveISCElements(lineend, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
            if (debug) console.log("[retrieveCoreSelector] local isc [0, 1, 2]:", isc[0], isc[1], isc[2]);
            if      (isc[1][Clip8.RECTTAG].length == 1)
                return [Clip8.RECTSELECTOR, isc[1][Clip8.RECTTAG]];
            else
                Clip8._reportError("retrieveCoreSelector", "Invalid core selector.", Clip8._reduce(isc[1]), [lineend],
                                   "A selector (connector element) was found but a valid core selector at its other end was not found. Highlighted in red may be any invalid elements found instead.");
        }
        else
            if (S[Clip8.RECTTAG].length == 1)
                return [Clip8.RECTSELECTOR, S[Clip8.RECTTAG]];
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
        var s; // The rectangle to be used as area of selection
        if (selectorcore[0] instanceof SVGRectElement) {
            // rectangle
            s = selectorcore[0];
        }
        else if (selectorcore[0] instanceof SVGLineElement && selectorcore[1] instanceof SVGLineElement) {
            // DELETE: X icon defines the selection area
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
        var dashes = window.getComputedStyle(selectorcore[0])
                           .getPropertyValue('stroke-dasharray')
                           .split(",").map(parseFloat);
        if (dashes.length == 2 && dashes[0] < dashes[1] )
            return Svgretrieve.getEnclosedRectangles(s);
        else if (dashes.length == 2 && dashes[0] > dashes[1] )
            return Svgretrieve.getIntersectingRectangles(s);
        else
            Clip8._reportError("selectedElementSet", "Invalid `stroke-dasharray` in SELECTOR.", selectorcore, [],
                              "For example, gaps and dashes of the SELECTOR AREA are exactly of the same length: Then there is no way of determining whether it selects INTERSECTING or ENCLOSED objects."
                              );
    },

    moveIP: function (C, p0) {
        var debug = false;
        var epsilon = 0.01;

        if ( C[Clip8.CIRCLETAG].length == 2 )
            return Clip8.TERMINATE;
        else if (C[Clip8.PATHTAG].length == 1) {
            Clip8.ip = C[Clip8.PATHTAG][0];   // move instruction pointer
            Clip8.pminus1_point = p0;         // indicate old instruction pointer
            return Clip8.EXECUTE;
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
                        Clip8._reportError("moveIP", "ALTERNATIVE is missing a SELECTOR.", C[Clip8.POLYLINETAG], endpoints);
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
                        Clip8._reportError("moveIP", "Invalid CONTROLFLOW at ALTERNATIVE.", condISC[2][Clip8.PATHTAG], [condpoint]);
                else
                    if (oppositeISC[2][Clip8.PATHTAG].length == 1) {
                        Clip8.ip = oppositeISC[2][Clip8.PATHTAG][0];   // move instruction pointer opposite side
                        Clip8.pminus1_point = oppositepoint;           // indicate old instruction pointer
                    }
                    else
                        Clip8._reportError("moveIP", "Invalid CONTROLFLOW at ALTERNATIVE.", oppositeISC[2][Clip8.PATHTAG], [condpoint]);
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
                    Clip8._reportError("moveIP", "Invalid control flow at merge.", Clip8._reduce(localISC[2]), [points[1]]);
            }
            return Clip8.CONTINUE;
        } else
            // FIXME: Add an additional check for nearby candidate elements.
            Clip8._reportError("moveIP", "Invalid control flow.", Clip8._reduce(C), [p0],
                               "There should be exactly one end of a suitable control flow element. There seem to be multiple or none.");

        Clip8._reportError("moveIP", "INTERNAL ERROR: Unforeseen condition!", [], [], Clip8.INTERNAL_ERROR_HINT);
    },

    initControlFlow: function () {
        var debug = false;
        if (debug) console.log("[initControlFlow]")
        var debugcolour = false;
        var circles = Clip8.svgroot.getElementsByTagName("circle");
        var centres_offilled = [];  // Centres of filled circles (candidates).
        var radii_offilled = [];    // and their respective radius
        var initialflow = null;

        for (var i = 0, c; i < circles.length; i++) {
            // FIXME: clarify use of style vs attribute
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
                    var candidates = Svgretrieve.getISCbyLocation(
                                  centres_offilled[i],
                                  radii_offilled[i]*Clip8.CIRCLE_CENTRE_TOLERANCE_RATIO*5,
                                  10,
                                  ['path'],
                                  Svgretrieve.C_collection);
                    Clip8._reportError("initControlFlow", "Failed to identify intial path segment.", candidates, [centres_offilled[i]],
                                       "An intitial element was found but there seems to be no control flow path close enough to its centre. If there are candidates nearby they are highlighted in red: Try using snap in your SVG editor to increase drawing precision.");
                }

                // FIXME: clarify use of style vs attribute
                if (debugcolour) hitlist[0].setAttribute("stroke", "#ED1E79");
                Clip8.pminus1_point = centres_offilled[i];
                if (Clip8.visualiseIP) Clip8._highlightElement(hitlist[0]);
                return hitlist[0];
            }
        }
        Clip8._reportError("initControlFlow", "Failed to idendify point of entry.", circles, [],
                           "Control flow starts at a single filled circle. If it is co-located with other cicles it might not be recognised.");
    },

    executeOneOperation: function() {
        var debug = true;
        var p0candidates, p0;
        if (debug) console.log("[EXECUTEONEOPERATION] Clip8.ip, svgroot:", Clip8.ip);

        // initialise control flow if necessary
        if (Clip8.ip == undefined)
            Clip8.ip = Clip8.initControlFlow();

        if (Clip8.ip.tagName == "path")
            p0candidates = Svgdom.getBothEndsOfPath(Clip8.ip);
        else
            Clip8._reportError("executeOneOperation", "INTERNAL ERROR: invalid IP!", Clip8.ip, [], Clip8.INTERNAL_ERROR_HINT);

        if ( Svgdom.euclidDistance(Clip8.pminus1_point, p0candidates[0]) < 1.0*Clip8.STROKE_TOLERANCE_RATIO )
            if ( Svgdom.euclidDistance(Clip8.pminus1_point, p0candidates[1]) > 1.0*Clip8.PATH_MIN_DETAIL_RATIO )
                p0 = p0candidates[1];
            else
                Clip8._reportError("executeOneOperation", "Ambiguous control flow.", [Clip8.ip], p0candidates,
                                   "Control is not clearly drawn so that it is not clear which end to take. Both ends are too close to the former anchor point (p0) of the former instruction.");
        else
            if ( Svgdom.euclidDistance(Clip8.pminus1_point, p0candidates[0]) > 1.0*Clip8.PATH_MIN_DETAIL_RATIO )
                p0 = p0candidates[0];
            else
                Clip8._reportError("executeOneOperation", "Ambiguous control flow.", [Clip8.ip], p0candidates,
                                   "Control is not clearly drawn so that it is not clear which end to take. Both ends are too close to the former anchor point (p0) of the former instruction.");


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

        if (execstatus != Clip8.EXECUTE)
            return execstatus;

        var retrselector = Clip8.retrieveCoreSelector(S0, p0)
        var selectortype = retrselector[0];
        var coreselector = retrselector[1];
        if      (selectortype == Clip8.RECTSELECTOR)
            var selectedelements1 = Clip8.selectedElementSet(coreselector);
        else if (selectortype == Clip8.UNKNOWNSELECTOR)
            // We may not be able to detect the selector for now.
            // Depending on the instruction this does however not necessarily matter.
            {}
        else
            Clip8._reportError("executeOneOperation", "INTERNAL ERROR: Invalid selector type!", Clip8._reduce(S0), [p0], Clip8.INTERNAL_ERROR_HINT);

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
                        else
                            Clip8._reportError("executeOneOperation", "Encountered invalid line arrow combination in ALIGN. (line: vertical, arrow: "+angledir+"", [theline, thepoly], [p0],
                                               "For an align operation, the line of alignment and the direction of the arrow must match. For instance, when aligning to the left, the line must be vertical and the arrow must point to the left. For up, the line must be horizontal and the arrow must point upwards.");
                        break;
                    case 'LEFT':
                    case 'RIGHT':
                        if (angledir == 'UP')           Paperclip.alignrelTop (selectedelements1);
                        else if (angledir == 'DOWN')    Paperclip.alignrelBottom (selectedelements1);
                        else
                            Clip8._reportError("executeOneOperation", "Encountered invalid line arrow combination in ALIGN. (line: horizontal, arrow: "+angledir+"", [theline, thepoly], [p0],
                                               "For an align operation, the line of alignment and the direction of the arrow must match. For instance, when aligning to the left, the line must be vertical and the arrow must point to the left. For up, the line must be horizontal and the arrow must point upwards.");
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
                // FIXME: clarify use of style vs attribute
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
                            if (opposite_diagonals.length != 1)
                                Clip8._reportError("executeOneOperation", "Ambiguous diagonals in instruction.", [theline], [p3, p4],
                                                   "The lines are not arranged so that two of them clearly belong to a DELETE instruction. The other diagonal may be missing entirely, or there could be too many. If there are exactly two and you still get this error, please make sure that they are neatly aligned. Using a snap to grid or an align functionality of your SVG editor will help.");

                            selectedelements1 = Clip8.selectedElementSet([theline, opposite_diagonals[0]]);
                            for (var i = 0; i < selectedelements1.length; i++)
                                selectedelements1[i].parentElement.removeChild(selectedelements1[i]);
                            break;
                        default:
                            Clip8._reportError("executeOneOperation", "INTERNAL ERROR: Unforeseen line direction in DELETE!", [theline], [p0], Clip8.INTERNAL_ERROR_HINT);
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
            return Clip8.EXECUTE;
        }
        else
            Clip8._reportError("exec", "Could not decode instruction.", Clip8._reduce(I0).concat(Clip8._reduce(S0)).concat(Clip8._reduce(C0)), [p0]);
    },

    init: function (svgroot, visualiseIP, highlightErr, highlightSyntax) {
        console.log("[clip8.init]", svgroot);
        Clip8.ip = undefined;   // invalidate old instruction pointer
                                // This signals to executeOneOperation to init a new one
                                // when executing the first instruction after init.
        if (!(svgroot instanceof SVGElement)) { throw "[clip8] no SVG root."; }
        Clip8.visualiseIP = visualiseIP;
        Clip8.highlightErr = highlightErr;
        Svgdom.init(svgroot);
        Svgretrieve.init(svgroot, highlightErr, highlightSyntax, Clip8._hightlightElementColour);
        Clip8.cyclescounter = 0
        Clip8.svgroot = svgroot;
        return svgroot;
    }
};

var Clip8controler = {
    INIT:        0,
    READY:       1,
    RUNNING:     2,
    TERMINATED:  3,
    ERROR:      64,
    svgroot: null,
    erroroutput: undefined,
    state: undefined,
    maxcycles: 1000,
    cyclescounter: 0,
    exectimer: undefined,

    _execOneCycle: function () {
        var enginestatus;
        Clip8controler.cyclescounter++;
        if (Clip8controler.maxcycles > 0 && Clip8controler.cyclescounter >= Clip8controler.maxcycles) {
            Clip8controler.stopTimer();
            throw "Maximal number of cycles";
        }
        try {
            enginestatus = Clip8.executeOneOperation();
            if (enginestatus == Clip8.TERMINATE) {
                Clip8controler._stopTimer();
                Clip8controler.state = Clip8controler.TERMINATED;
                console.log("TERMINATED-state.");
            }
        }
        catch (exc) {
            console.log("Hint:", exc);
            Clip8controler._stopTimer();
            if (exc.error) {
                Clip8controler.erroroutput.appendChild(document.createTextNode(exc.error));
                Clip8controler.hintoutput.appendChild(document.createTextNode(exc.hint));
            } else {
                Clip8controler.erroroutput.appendChild(document.createTextNode("unexpected error!"));
                Clip8controler.hintoutput.appendChild(document.createTextNode(exc));
            }
            Clip8controler.state = Clip8controler.ERROR;
            console.log("ERROR-state.", exc);
        }
    },

    _startTimer: function () {
        Clip8controler.exectimer = setInterval( function() { Clip8controler._execOneCycle() }, 50 );
    },

    _stopTimer: function () {
        if (Clip8controler.exectimer)
            clearInterval(Clip8controler.exectimer);
    },


    init: function (svgroot, visualiseIP, highlightErr, highlightSyntax) {
        Clip8controler.cyclescounter = 0;
        if (Clip8controler.state == Clip8controler.ERROR) {
            while (Clip8controler.erroroutput.firstChild)
                Clip8controler.erroroutput.removeChild(Clip8controler.erroroutput.firstChild);
            while (Clip8controler.hintoutput.firstChild)
                Clip8controler.hintoutput.removeChild(Clip8controler.hintoutput.firstChild);
        }
        Clip8controler.state = Clip8controler.INIT;
        console.log("[INIT] svgroot, visualiseIP, highlightErr, highlightSyntax", svgroot, visualiseIP, highlightErr, highlightSyntax);
        Clip8controler.svgroot;
        Clip8controler.erroroutput = document.getElementById("erroroutput");
        Clip8controler.hintoutput = document.getElementById("hintoutput");
        Clip8.init(svgroot, visualiseIP, highlightErr, highlightSyntax);
        Clip8controler.state = Clip8controler.READY;
    },

    testRun: function (maxcycles) {
        console.log("TEST-RUN: maxcycles:", maxcycles);
        if (Clip8controler.state != Clip8controler.READY)
            throw "[testRun] not READY.";
        Clip8controler.maxcycles = maxcycles;
        Clip8controler._startTimer();
        Clip8controler.state = Clip8controler.RUNNING;
    },

    playAction: function () {
        console.log("PLAY clip_8");
        if (Clip8controler.state == Clip8controler.READY) {
            Clip8controler.maxcycles = 0;
            Clip8controler._startTimer();
            Clip8controler.state = Clip8controler.RUNNING;
            console.log("  ...RUNNING-state");
        } else {
            console.log("  ...ignored.");
        }
    },

    pauseAction: function () {
        console.log("PAUSE clip_8");
        if (Clip8controler.state == Clip8controler.RUNNING) {
            Clip8controler._stopTimer();
            Clip8controler.state = Clip8controler.READY;
            console.log("  ...READY-state.");
        } else {
            console.log("  ...ignored.");
        }
    },

    stepAction: function () {
        console.log("STEP clip_8");
        if (Clip8controler.state == Clip8controler.READY)
            Clip8.executeOneOperation(Clip8controler.svgroot);
        else
            console.log("  ...ignored.");
    }
}
