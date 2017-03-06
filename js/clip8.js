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
var minlen = 0.5;       // minimal size of a graphics element to be "meaningful"

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
    maxcycles: 1000,
    cyclescounter: 0,
    exectimer: undefined,
    svgroot: undefined,
    ip: undefined,           // instruction pointer
    pminus1_area: undefined, // p0area of former round.
    blocklist: [],      // list of elements already retrieved during current instruction cycle.
    visualise: false,   // visualise processing activity to the user
    highlighted: [],    // list of elements highlighted for visualization

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
        //console.log("VISL:", el);
        var old = el.getAttribute("stroke");
        el.setAttribute("stroke",  "#fff");
        Clip8.highlighted.push({el: el, origstroke: old});
    },

    _clearHighlight: function() {
        for (var i = 0; i < Clip8.highlighted.length; i++) {
            Clip8.highlighted[i].el.setAttribute("stroke", Clip8.highlighted[i].origstroke);
        }
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
            if (!el.getAttribute("stroke", "none") || el.getAttribute("stroke", "none") == "none")
                continue;   // ignore data elements with no stroke.
                // FIXME: Consistent data object detection across the whole code.
            if (el instanceof SVGRectElement)
                points = Svgdom.getCornersOfRectPoints(el);
            else if (el instanceof SVGPathElement)
                points = Svgdom.getBothEndsOfPath(el);
            else if (el instanceof SVGLineElement)
                points = Svgdom.getBothEndsOfLine(el);
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

    retrieveISCElements: function (arearect, tagsI, tagsS, tagsC) {
        var debug = false;
        if (debug) console.log("[RETRIEVEISCELEMENTS] arearect:", arearect);
        var hitlist = Svgretrieve.getIntersectedElements(arearect);
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
                     hitlist[i].tagName == "line" ||
                     hitlist[i].tagName == "circle" ||
                     hitlist[i].tagName == "polyline") ) {
                    C = Clip8decode.pushByTagname(hitlist[i], tagsC, C);
                    Clip8.blocklist.push(hitlist[i]);
                }
                else {
                    hitlist[i].setAttribute("stroke", "#ED1E79");
                    throw "[retrieveISCElements] UGO, unknown graphics object: "+hitlist[i];
                }
            }
            else
                if (debug) console.log("[retrieveISCElements] ignore blocklisted element:", Clip8._isBlocklisted(hitlist[i]) );
        }
        return [I, S, C];
    },

    retrieveCoreSelector: function (S, originarea) {
        var debug = false;
        if (debug) console.log("[RETRIEVECORESELECTOR] S:", S);
        var coreS;
        if (S[Clip8.LINETAG].length == 1) {
            // there is a selector
            var epsilon = 0.01;
            var lineend = Svgdom.getBothEndsOfLine_arranged(originarea, S[Clip8.LINETAG][0])[1];
            var arearect = Svgdom.epsilonRectAt(lineend, epsilon);
            var isc = Clip8.retrieveISCElements(arearect, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
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

    reduceSelectionHitlist: function (hitlist) {
        var selection = [];
                for ( var i = 0; i < hitlist.length; i++ )
            if ( hitlist[i].tagName == "rect" &&
                 (!hitlist[i].getAttribute("stroke") ||
                  hitlist[i].getAttribute("stroke") == "none" ||
                  hitlist[i].getAttribute("fill") != "none"
                 ) )
                 selection.push(hitlist[i]);
        // console.log("[selectedElementSet] hitlist, selection:", hitlist, selection);
        return selection;
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
            s = Clip8.svgroot.createSVGRect();
            s.x = selectorcore[0].x.baseVal.value;
            s.y = selectorcore[0].y.baseVal.value;
            s.width = selectorcore[0].width.baseVal.value;
            s.height = selectorcore[0].height.baseVal.value;
        }
        else if (selectorcore[0] instanceof SVGLineElement && selectorcore[1] instanceof SVGLineElement) {
            // DELETE: X icon defines the selection area
            var dashes = selectorcore[0].getAttribute("stroke-dasharray").split(",").map(parseFloat);
            s = Clip8.svgroot.createSVGRect();
            var x1, y1, x2, y2;
            x1 = parseFloat(selectorcore[0].getAttribute("x1"));
            y1 = parseFloat(selectorcore[0].getAttribute("y1"));
            x2 = parseFloat(selectorcore[0].getAttribute("x2"));
            y2 = parseFloat(selectorcore[0].getAttribute("y2"));
            s.x = Math.min(x1, x2);
            s.y = Math.min(y1, y2);
            s.width = Math.max(x1, x2) - s.x;
            s.height = Math.max(y1, y2) - s.y;
        }
        else
        {
            if (debug) console.log("[selectedElementSet] UNKNOWN SELECTOR, returning undefined.");
            return undefined;
        }
        if (debug) console.log("[selectedElementSet] selector from selectorcore:", s);
        if (dashes.length == 2 && dashes[0] < dashes[1] )
            hitlist = Svgretrieve.getEnclosedElements(s);
        else if (dashes.length == 2 && dashes[0] > dashes[1] )
            hitlist = Svgretrieve.getIntersectedElements(s);
        else throw "[selectedElementSet] invalid dash pattern."

        return Clip8.reduceSelectionHitlist(hitlist);
    },

    // Constants
    TERMINATE: 0,
    CONTINUE: 1,
    EXECUTE: 2,
    moveIP: function (C, arearect) {
        var debug = false;
        var epsilon = 0.01;
        if ( C[Clip8.CIRCLETAG].length == 2 )
            return Clip8.TERMINATE;
        else if (C[Clip8.PATHTAG].length == 1) {
            Clip8.ip = C[Clip8.PATHTAG][0];   // move instruction pointer
            Clip8.pminus1_area = arearect;    // indicate old instruction pointer area
        }
        else if (C[Clip8.POLYLINETAG].length == 1) {
            if (debug) console.log("[moveIP] polyline.");
            var points = Svgdom.getPointsOfPoly(C[Clip8.POLYLINETAG][0]);
            if (Svgdom.enclosesRectPoint(arearect, points[1])) {
                // Alternative
                console.log("ALTERNATIVE");
                var endpoints = [points[0], points[2]];
                if (debug) console.log("[moveIP] endpoints:", endpoints);
                var arearectA = Svgdom.epsilonRectAt(endpoints[0], epsilon);
                var localISCa = Clip8.retrieveISCElements(
                                    arearectA,
                                    Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                var arearectB = Svgdom.epsilonRectAt(endpoints[1], epsilon);
                var localISCb = Clip8.retrieveISCElements(
                                    arearectB,
                                    Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                var condISC;            // the ISC where the condition is attached
                var oppositeISC;        // the ISC opposite to where the condition is attached
                var condarearect;       // the arearect where the condition is attached
                var oppositearearect;   // the arearect opposite to where the condition is attached
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
                        condarearect = arearectB;
                        oppositeISC = localISCa;
                        oppositearearect = arearectA;
                    }
                }
                else {
                    condISC = localISCa;
                    condarearect = arearectA;
                    oppositeISC = localISCb;
                    oppositearearect = arearectB;
                }
                var retrselector = Clip8.retrieveCoreSelector(condISC[1], condarearect);
                var selectortype = retrselector[0];
                var coreselector = retrselector[1];
                var condselected = Clip8.selectedElementSet(coreselector);
                if (condselected.length > 0)
                    if (condISC[2][Clip8.PATHTAG].length == 1) {
                        Clip8.ip = condISC[2][Clip8.PATHTAG][0];   // move instruction pointer to cond side
                        Clip8.pminus1_area = condarearect;         // indicate old instruction pointer area
                    }
                    else
                        throw "[moveIP] Invalid control flow at alternative.";
                else
                    if (oppositeISC[2][Clip8.PATHTAG].length == 1) {
                        Clip8.ip = oppositeISC[2][Clip8.PATHTAG][0];   // move instruction pointer opposite side
                        Clip8.pminus1_area = oppositearearect;         // indicate old instruction pointer area
                    }
                    else
                        throw "[moveIP] Invalid control flow at alternative.";
            }
            else {
                // Merge
                console.log("MERGE");
                var mergearea = Svgdom.epsilonRectAt(points[1], epsilon)
                var localISC = Clip8.retrieveISCElements(
                                    mergearea,
                                    Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                if (localISC[2][Clip8.PATHTAG].length == 1) {
                    Clip8.ip = localISC[2][Clip8.PATHTAG][0];   // move instruction pointer
                    Clip8.pminus1_area = mergearea;             // indicate old instruction pointer area
                }
                else if (localISC[2][Clip8.LINETAG].length == 1) {
                    Clip8.ip = localISC[2][Clip8.LINETAG][0];   // move instruction pointer
                    Clip8.pminus1_area = mergearea;             // indicate old instruction pointer area
                }
                else
                    throw "[moveIP] Invalid control flow at merge.";
            }
            return Clip8.CONTINUE;
        }
        else
            throw "[moveIP] Invalid control flow.";
        return Clip8.EXECUTE;
    },

    initControlFlow: function () {
        var debug = true;
        var debugcolour = false;
        var circles = Clip8.svgroot.getElementsByTagName("circle");
        var centres_offilled = [];  // Centres of filled circles (candidates).
        var centrareas = [];        // Epsilon rectangles arount each circle centre.
        var initialflow = null;

        for (var i = 0, c; i < circles.length; i++) {
            if (debugcolour) circles[i].setAttribute("stroke", "#95C9EF");
            c = Svgdom.getCentrePoint(circles[i]);
            centrareas.push ( Svgdom.epsilonRectAt(c, epsilon) );
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
                var hitarea = Svgdom.epsilonRectAt(hit, epsilon);
                var hitlist = Svgretrieve.getIntersectedElements(hitarea);
                if (debug) console.log("[initControlFlow] , hit, hitarea, hitlist:", hit, hitarea, hitlist);
                for ( var k = 0; k < hitlist.length; k++ ) {
                    if (hitlist[k].tagName == "path") {
                        if (debugcolour)hitlist[k].setAttribute("stroke", "#ED1E79");
                        Clip8.pminus1_area = hitarea;
                        if (Clip8.visualise) Clip8._highlightElement(hitlist[k]);
                        return hitlist[k];
                    }
                }
            }
        }
        throw "Failed to idendify point of entry."
    },

    executeOneOperation: function() {
        var debug = true;
        if (debug) console.log("[EXECUTEONEOPERATION] Clip8.ip, svgroot:", Clip8.ip);
        Clip8.cyclescounter++;
        if (Clip8.maxcycles > 0 && Clip8.cyclescounter >= Clip8.maxcycles) {
            Clip8.clearExecTimer();
            throw "Maximal number of cycles";
        }
        var p0candidates;
        if (Clip8.ip.tagName == "path")
            p0candidates = Svgdom.getBothEndsOfPath(Clip8.ip);
        else if (Clip8.ip.tagName == "line")
            p0candidates = Svgdom.getBothEndsOfLine(Clip8.ip);
        else throw "[executeOneOperation] expected path or line as ip element.";

        var p0;
        if ( Svgdom.enclosesRectPoint(Clip8.pminus1_area, p0candidates[0]) )
            if ( Svgdom.enclosesRectPoint(Clip8.pminus1_area, p0candidates[1]) )
                throw "Control flow ambiguous/both path ends close to former p0."
            else
                p0 = p0candidates[1];
        else
            p0 = p0candidates[0];
        var p0area = Svgdom.epsilonRectAt(p0, epsilon);
        // reset the blocklist and fetch a new instruction
        Clip8.blocklist = [Clip8.ip];
        var ISC0 = Clip8.retrieveISCElements(p0area, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
        var I0 = ISC0[0];
        var S0 = ISC0[1];
        var C0 = ISC0[2];
        if (debug) console.log("[executeOneOperation] I0:", I0.reduce(function(a,b) {return a.concat(b)}));
        if (debug) console.log("[executeOneOperation] S0:", S0.reduce(function(a,b) {return a.concat(b)}));
        if (debug) console.log("[executeOneOperation] C0:", C0.reduce(function(a,b) {return a.concat(b)}));
        if (Clip8.visualise) {
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
        var execstatus = Clip8.moveIP(C0, p0area);
        switch (execstatus) {
            case Clip8.EXECUTE:
                break;      // redundant but more readable.
            case Clip8.CONTINUE:
                return;     // without any instruction execution in this cycle
            case Clip8.TERMINATE:
                Clip8.clearExecTimer();
                return;     // stop execution
        }
        var retrselector = Clip8.retrieveCoreSelector(S0, p0area)
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
            var bothends = Svgdom.getBothEndsOfLine_arranged(p0area, theline);
            if (debug) console.log("[executeOneOperation] theline:", theline);
            if (I0[Clip8.POLYLINETAG].length == 1) {
                // ALIGN
                if (debug) console.log("[executeOneOperation] 1 line, 1 polyline.");
                var linedir = Clip8decode.directionOfSVGLine(theline, epsilon, minlen);
                if (debug) console.log("[executeOneOperation] direction:", linedir);
                var thepoly = I0[Clip8.POLYLINETAG][0];
                var angledir = Clip8decode.directionOfPolyAngle(thepoly, epsilon, minlen);
                if (debug) console.log("[executeOneOperation] angle direction:", angledir);
                var arearect = Svgdom.epsilonRectAt(bothends[1], epsilon);
                var ISC1 = Clip8.retrieveISCElements(arearect, Clip8.TAGS, Clip8.TAGS, Clip8.TAGS);
                var I1 = ISC1[0];
                var S1 = ISC1[1];
                if (debug) console.log("[executeOneOperation] I1:", I1.reduce(function(a,b) {return a.concat(b)}));
                if (debug) console.log("[executeOneOperation] S1:", S1.reduce(function(a,b) {return a.concat(b)}));
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
                    default:        throw "[executeOneOperation] Encountered invalid line direction (a)."; break;
                }
            }
            else if (I0[Clip8.POLYLINETAG].length == 0 && I0[Clip8.RECTTAG].length == 0) {
                // MOVE-REL, CUT, DEL
                if (theline.getAttribute("stroke-dasharray")) {
                    if (debug) console.log("one dashed line.");
                    // CUT, DEL
                    var linedir = Clip8decode.directionOfSVGLine(theline, epsilon, minlen);
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
                            var hitlist = Svgretrieve.getEnclosedElements(stripe);
                            if (debug) console.log("[executeOneOperation] hitlist:", hitlist);
                            var selectedelements1 = []
                            for (var i = 0; i < hitlist.length; i++)
                                if ( Svgretrieve.checkIntersected(hitlist[i], above) &&
                                     Svgretrieve.checkIntersected(hitlist[i], below) )
                                    selectedelements1.push(hitlist[i]);

                            selectedelements1 = Clip8.reduceSelectionHitlist(selectedelements1);
                            if (debug) console.log("[executeOneOperation] selectedelements1:", selectedelements1);
                            Paperclip.cutHorizontal(selectedelements1, theline.getAttribute("y1"));
                            break;
                        case 'UP-RE':
                        case 'UP-LE':
                        case 'DO-RE':
                        case 'DO-LE':
                            // DEL
                            var p3 = Clip8.svgroot.createSVGPoint();
                            var p4 = Clip8.svgroot.createSVGPoint();
                            p3.x = theline.getAttribute("x1");
                            p3.y = theline.getAttribute("y2");
                            p4.x = theline.getAttribute("x2");
                            p4.y = theline.getAttribute("y1");
                            var opposite_diagonals = Svgretrieve.getLinesFromTo(p3, p4, epsilon);
                            if (debug) console.log("[executeOneOperation] opposite_diagonals:", opposite_diagonals);
                            opposite_diagonals = Clip8.removeFalsePositives(Svgdom.epsilonRectAt(p3, epsilon), opposite_diagonals);
                            if (debug) console.log("[executeOneOperation] opposite_diagonals (red):", opposite_diagonals);
                            if (opposite_diagonals.length != 1) throw "[executeOneOperation / del] ambiguous diagonals.";
                            var selectedelements1 = Clip8.selectedElementSet([theline, opposite_diagonals[0]]);
                            for (var i = 0; i < selectedelements1.length; i++)
                                selectedelements1[i].parentElement.removeChild(selectedelements1[i]);
                            break;
                        default:        throw "[executeOneOperation] Encountered invalid line direction (b).";  break;
                    }
                }
                else {
                    // MOVE-REL
                    var circles = Svgretrieve.getCirclesAt(
                        bothends[1],
                        theline.getAttribute("stroke-width"),         // use as minimum radius
                        theline.getAttribute("stroke-width") * 4 );   // use as minimum radius
                    if (debug) console.log("[executeOneOperation/move-rel] circles:", circles);
                    var deltaX, deltaY;
                    deltaX = bothends[1].x-bothends[0].x;
                    deltaY = bothends[1].y-bothends[0].y;
                    Paperclip.moveBy(selectedelements1, deltaX, deltaY);
                }
            }
            else if (I0[Clip8.RECTTAG].length == 1) {
                // CLONE
                if (debug) console.log("[executeOneOperation/clone]");
                var deltaX, deltaY;
                deltaX = bothends[1].x-bothends[0].x;
                deltaY = bothends[1].y-bothends[0].y;
                Paperclip.clone_moveBy(selectedelements1, deltaX, deltaY);
            }
        }
        else
            throw "Could not decode instruction X";
    },

    init: function (svgroot) {
        console.log("[clip8.init]", svgroot);
        if (!(svgroot instanceof SVGElement)) { throw "[clip8] no SVG root."; }
        // crucial init operations
        Svgdom.init(svgroot);
        Svgretrieve.init(svgroot);
        Clip8.cyclescounter = 0
        Clip8.svgroot = svgroot;
        Clip8.ip = Clip8.initControlFlow();     // instruction pointer: the active control flow path
        return svgroot;
    },

    envokeOperation: function () {
        console.log("[CLIP8ENVOKEOPERATION] svgroot:", Clip8.svgroot);
        Clip8.exectimer = setInterval( function() { Clip8.executeOneOperation() }, 50 );
    },

    clearExecTimer: function () {
        clearInterval(Clip8.exectimer);
    }
};

var Clip8controler = {
    svgroot: null,

    init: function (svgroot, visualise) {
        console.log("INIT", svgroot);
        Clip8.visualise = visualise;
        Clip8controler.svgroot;
        Clip8.init(svgroot);
    },

    testRun: function (maxcycles) {
        console.log("TEST-RUN: maxcycles:", maxcycles);
        Clip8.visualise = false;
        Clip8.maxcycles = maxcycles;
        Clip8.envokeOperation();
    },

    playAction: function () {
        console.log("PLAY clip_8");
        Clip8.maxcycles = 0;
        Clip8.envokeOperation();
        Clip8.visualise = true;
        Clip8controler.initialised = true;
    },

    pauseAction: function () {
        console.log("not implemented: PAUSE clip_8");
    },

    stepAction: function () {
        console.log("STEP clip_8");
        Clip8.executeOneOperation(Clip8controler.svgroot);
    },

    stopAction: function () {
        console.log("STOP clip_8");
        location.reload();
    }
}
