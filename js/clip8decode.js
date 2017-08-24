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

var OP = {
    DECODE_ERROR: 0x0000,
    XXXX:         0x0001,
    MOVE_REL:     0x0002,
    ALIGN:        0x0004,
    CUT:          0x0008,
    CLONE:        0x0010,
    DEL:          0x0020,
    TRAFO:        0x0040
};

var DIRECTION = {
    NONE:         0x0000,
    UP:           0x0001,
    DOWN:         0x0002,
    RIGHT:        0x0004,
    LEFT:         0x0008,
    UP_RIGHT:     0x0005,
    UP_LEFT:      0x0009,
    DOWN_RIGHT:   0x0006,
    DOWN_LEFT:    0x000A
};

var Clip8decode = {
    minlen:    0.5,        // minimal size of a graphics element to be "meaningful"
    epsilon:   0.25,       // maximal difference for two coordinates to be considered equal
    deriveToleranceFromElementStroke: function (el) {
        var tolerance = ISCD.getExplicitProperty(el, 'stroke-width') * Clip8.STROKE_TOLERANCE_RATIO;
        if (! tolerance) {
            console.warn("Could not derive tolerance from stroke width.", el);
            tolerance = 1.0 * Clip8.STROKE_TOLERANCE_RATIO;
        }
        return tolerance;
    },
    // FIXME: Could be refactored based on adding flags
    _directionBasedonDeltas: function (deltax, deltay) {
        if ( Math.abs(deltax) < Clip8decode.epsilon && Math.abs(deltay) > Clip8decode.minlen )
            // vertical
            if (deltay > 0)     return DIRECTION.DOWN;
            else                return DIRECTION.UP;
        else if ( Math.abs(deltay) < Clip8decode.epsilon && Math.abs(deltax) > Clip8decode.minlen )
            // horizontal
            if (deltax > 0)     return DIRECTION.RIGHT;
            else                return DIRECTION.LEFT;
        else if (deltay < -Clip8decode.minlen)
            // UP
            if      (deltax > Clip8decode.minlen) return DIRECTION.UP_RIGHT;
            else if (deltax < -Clip8decode.minlen) return DIRECTION.UP_LEFT;
            else throw "Unklar, me and logic :-)";
        else if (deltay > Clip8decode.minlen)
            // DOWN
            if      (deltax > Clip8decode.minlen) return DIRECTION.DOWN_RIGHT;
            else if (deltax < -Clip8decode.minlen) return DIRECTION.DOWN_LEFT;
            else throw "Unklar, me and logic :-)";
        else throw "This should never happen, or, 'me and logic never worked' :-)";
    },

    directionOfSVGLine: function (line) {
        if (!(line instanceof SVGLineElement)) { throw "[directionOfSVGLine] expected line element."; }
        return Clip8decode._directionBasedonDeltas(
                               line.x2.baseVal.value - line.x1.baseVal.value,
                               line.y2.baseVal.value - line.y1.baseVal.value );
    },

    directionFromPoints: function (p1, p2) {
        return Clip8decode._directionBasedonDeltas(p2.x-p1.x, p2.y-p1.y);
    },

    directionOfPolyAngle: function (polyline) {
        if (!(polyline instanceof SVGPolylineElement)) { throw "[directionOfPolyAngle] expected line element."; }
        var debug = true;
        if (debug) console.log("directionOfPolyAngle: line", polyline);
        var coords = polyline.getAttribute("points").trim().split(/[\s,]+/);
        if (coords.length != 6) throw "[directionOfPolyAngle] expected 3 points (6 coordinates)."+coords.length+polyline.getAttribute("points").trim();

        var absdeltax = Math.abs(coords[0] - coords[4]);
        var absdeltay = Math.abs(coords[1] - coords[5]);
        if (absdeltax < Clip8decode.epsilon && absdeltay > Clip8decode.minlen)
            // pointing left or right
            if (coords[0] - coords[2] > Clip8decode.minlen) return DIRECTION.LEFT;
            else if (coords[0] - coords[2] < -Clip8decode.minlen) return DIRECTION.RIGHT;
            else throw "[directionOfPolyAngle] Angle to flat (l/r). "+coords;
        else if (absdeltay < Clip8decode.epsilon && absdeltax > Clip8decode.minlen)
            // pointing up or down
            if (coords[1] - coords[3] > Clip8decode.minlen) return DIRECTION.UP;
            else if (coords[1] - coords[3] < -Clip8decode.minlen) return DIRECTION.DOWN;
            else throw "[directionOfPolyAngle] Angle to flat (u/d). "+coords;
        else throw "[directionOfPolyAngle] Direction not detectable as left, right, up, down.";
    },

    getAxisAlignedXYLegs: function (points) {
        /** Returns the length of the X and Y legs of an axis-aligned right triangle.
         * Positive values indicate that the leg points in the direction of the corresponding axis,
         * i.e. the right angle is at the lower coordinate value on this axis.
         * `points` defines a rectangular, axis aligned right triangle as an array of points.
         * returns `{ x_leg: pX.x - O.x, y_leg: (pY.y - O.y) }`
         *
         *     pointing
         *     this
         *     direction
         *
         *       ^
         *       |      pY
         *       |      |\
         *       |      | \
         *       |      |  \
         *    y_leg     |   \
         *       |      |    \
         *       |      |     \
         *       |      |      \
         *       |      |       \
         *       |      |        \
         *       |      |         \
         *       |      O---------pX
         *
         *              -- x_leg --->  pointing this direction
         */
        if (points[0].x == points[1].x)
            // points[0, 1] create a vertical axis, one of them is O, and the other is pY
            if (points[0].y == points[2].y)
                // O = points[0], pY = points[1], pX = points[2]
                return { x_leg: (points[2].x - points[0].x),
                         y_leg: (points[1].y - points[0].y),
                         origin: points[0]};
            else if (points[1].y == points[2].y)
                // O = points[1], pY = points[0], pX = points[2]
                return { x_leg: (points[2].x - points[1].x),
                         y_leg: (points[0].y - points[1].y),
                         origin: points[1] };
            else
                throw { source:"getAxisAlignedXYLegs",
                        error: "Encountered unexpected coordinate combination." };
        else if (points[1].x == points[2].x)
            // points[1, 2] create a vertical axis, one of them is O, and the other is pY
            if(points[1].y == points[0].y)
                // O = points[1], pY = points[2], pX = points[0]
                return { x_leg: (points[0].x - points[1].x),
                         y_leg: (points[2].y - points[1].y),
                         origin: points[1] };
            else if (points[2].y == points[0].y)
                // O = points[2], pY = points[1], pX = points[0]
                return { x_leg: (points[0].x - points[2].x),
                         y_leg: (points[1].y - points[2].y),
                         origin: points[2] };
            else
                throw { source:"getAxisAlignedXYLegs",
                        error: "Encountered unexpected coordinate combination." };
        else if (points[0].x == points[2].x)
            // points[0, 2] create a vertical axis, one of them is O, and the other is pY
            if(points[0].y == points[1].y)
                // O = points[0], pY = points[2], pX = points[1]
                return { x_leg: (points[1].x - points[0].x),
                         y_leg: (points[2].y - points[0].y),
                         origin: points[0] };
            else if (points[2].y == points[1].y)
                // O = points[2], pY = points[0], pX = points[1]
                return { x_leg: (points[1].x - points[2].x),
                         y_leg: (points[0].y - points[2].y),
                         origin: points[2] };
            else
                throw { source:"getAxisAlignedXYLegs",
                        error: "Encountered unexpected coordinate combination." };
        else
            throw { source:"getAxisAlignedXYLegs",
                    error: "Encountered unexpected coordinate combination." };
    },

    decodeInstruction: function (I0, p0) {
        var verbose = true;
        var instruction = {};
        var line_like = I0[Clip8.LINETAG];      // Straight lines and synonyms
        var nontrivialpaths = [];               // Paths that are more than straight lines
        var cps;

        // find synonym elements
        // PATH
        for (var i=0; i<I0[Clip8.PATHTAG].length; i++) {
            cps = Svgdom.getAbsoluteControlpoints(
                                 I0[Clip8.PATHTAG][i].getAttribute('d'));
            if (cps.length == 2) line_like.push(I0[Clip8.PATHTAG][i]);
            else nontrivialpaths.push(el);
        }

        // decode the instruction
        if (line_like.length == 1) {
            // ALIGN, CUT, MOVE-REL, CLONE, DEL
            instruction.primary = line_like[0];
            var bothends;   // both ends of the primary, i.e. line-like element
            if (instruction.primary.tagName === "line")
                bothends = Svgdom.getBothEndsOfLine_arranged(p0, instruction.primary)
            else if (instruction.primary.tagName === "path")
                bothends = Svgdom.getBothEndsOfPath(instruction.primary)
            else
                throw "[decodeInstruction] unexpected line_like element.";
            Svgdom.arrangePoints(p0, bothends);
            instruction.p0prime = bothends[0];
            instruction.p1 = bothends[1];
            instruction.linedir = Clip8decode.directionFromPoints(
                                                  instruction.p0prime,
                                                  instruction.p1);
            if (I0[Clip8.POLYLINETAG].length == 1) {
                // ALIGN
                if (verbose) console.log("decoded ALIGN");
                instruction.opcode = OP.ALIGN;
                instruction.needsselector = true;
            }
            else if (I0[Clip8.RECTTAG].length == 1) {
                // CLONE
                if (verbose) console.log("CLONE");
                instruction.opcode = OP.CLONE;
                instruction.needsselector = true;
            }
            else if (I0[Clip8.POLYGONTAG].length == 1) {
                // TRANSFORM
                if (verbose) console.log("TRAFO");
                instruction.opcode = OP.TRAFO;
                instruction.needsselector = true;
            }
            else if (I0[Clip8.POLYLINETAG].length == 0 && I0[Clip8.RECTTAG].length == 0 && I0[Clip8.POLYGONTAG].length == 0) {
                // MOVE-REL, CUT, DEL
                if ( ISCD.getExplicitProperty(instruction.primary, 'stroke-dasharray') ) {
                    if (verbose) console.log("CUT / DELETE");
                    instruction.opcode = OP.CUT + OP.DEL;
                    instruction.needsselector = false;
                }
                else {
                    if (verbose) console.log("MOVE_REL");
                    instruction.opcode = OP.MOVE_REL;
                    instruction.needsselector = true;
                }
            }
            else {
                if (verbose) console.log("DECODE_ERROR");
                instruction.opcode = OP.DECODE_ERROR;
            }
        }
        else {
            if (verbose) console.log("DECODE_ERROR");
            instruction.opcode = OP.DECODE_ERROR;
        }
        return instruction;
    }
};
