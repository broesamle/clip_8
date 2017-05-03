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
}

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

    directionOfSVGLine: function (line) {
        if (!(line instanceof SVGLineElement)) { throw "[directionOfSVGLine] expected line element."; }

        var deltax = line.x2.baseVal.value - line.x1.baseVal.value;
        var deltay = line.y2.baseVal.value - line.y1.baseVal.value;
        if ( Math.abs(deltax) < Clip8decode.epsilon && Math.abs(deltay) > Clip8decode.minlen )
            // vertical
            if (deltay > 0)     return 'DOWN';
            else                return 'UP';
        else if ( Math.abs(deltay) < Clip8decode.epsilon && Math.abs(deltax) > Clip8decode.minlen )
            // horizontal
            if (deltax > 0)     return 'RIGHT';
            else                return 'LEFT';
        else if (deltay < -Clip8decode.minlen)
            // UP
            if      (deltax > Clip8decode.minlen) return 'UP-RE';
            else if (deltax < -Clip8decode.minlen) return 'UP-LE';
            else throw "Unklar, me and logic :-)";
        else if (deltay > Clip8decode.minlen)
            // DOWN
            if      (deltax > Clip8decode.minlen) return 'DO-RE';
            else if (deltax < -Clip8decode.minlen) return 'DO-LE';
            else throw "Unklar, me and logic :-)";
        else throw "This shoudl never happen, or, me and logic :-)";
    },

    directionOfPolyAngle: function (polyline) {
        if (!(polyline instanceof SVGPolylineElement)) { throw "[directionOfSVGLine] expected line element."; }
        var debug = true;
        if (debug) console.log("directionOfPolyAngle: line", polyline);
        var coords = polyline.getAttribute("points").trim().split(/[\s,]+/);
        if (coords.length != 6) throw "[directionOfSVGLine] expected 3 points (6 coordinates)."+coords.length+polyline.getAttribute("points").trim();

        var absdeltax = Math.abs(coords[0] - coords[4]);
        var absdeltay = Math.abs(coords[1] - coords[5]);
        if (absdeltax < Clip8decode.epsilon && absdeltay > Clip8decode.minlen)
            // pointing left or right
            if (coords[0] - coords[2] > Clip8decode.minlen) return 'LEFT';
            else if (coords[0] - coords[2] < -Clip8decode.minlen) return 'RIGHT';
            else throw "[directionOfPolyAngle] Angle to flat (l/r). "+coords;
        else if (absdeltay < Clip8decode.epsilon && absdeltax > Clip8decode.minlen)
            // pointing up or down
            if (coords[1] - coords[3] > Clip8decode.minlen) return 'UP';
            else if (coords[1] - coords[3] < -Clip8decode.minlen) return 'DOWN';
            else throw "[directionOfPolyAngle] Angle to flat (u/d). "+coords;
        else throw "[directionOfPolyAngle] Direction not detectable as left, right, up, down.";
    },

    decodeInstruction: function (I0, p0) {
        var verbose = true;
        var instruction = {};
        if (I0[Clip8.LINETAG].length == 1) {
            // ALIGN, CUT, MOVE-REL, CLONE, DEL
            instruction.primary = I0[Clip8.LINETAG][0];
            instruction.p1 = Svgdom.getBothEndsOfLine_arranged(p0, instruction.primary)[1];
            instruction.linedir = Clip8decode.directionOfSVGLine(instruction.primary);
            if (I0[Clip8.POLYLINETAG].length == 1) {
                // ALIGN
                if (verbose) console.log("decoded ALIGN");
                instruction.opcode = OP.ALIGN;
            }
            else if (I0[Clip8.POLYLINETAG].length == 0 && I0[Clip8.RECTTAG].length == 0) {
                // MOVE-REL, CUT, DEL
                if ( ISCD.getExplicitProperty(instruction.primary, 'stroke-dasharray') ) {
                    if (verbose) console.log("CUT / DELETE");
                    instruction.opcode = OP.CUT + OP.DEL;
                }
                else {
                    if (verbose) console.log("MOVE_REL");
                    instruction.opcode = OP.MOVE_REL;
                }
            }
            else if (I0[Clip8.RECTTAG].length == 1) {
                // CLONE
                if (verbose) console.log("CLONE");
                instruction.opcode = OP.CLONE;
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
}
