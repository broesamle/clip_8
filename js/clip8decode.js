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

var Clip8decode = {
    directionOfSVGLine: function (line, epsilon, minlen) {
        if (!(line instanceof SVGLineElement)) { throw "[directionOfSVGLine] expected line element."; }
        if (!epsilon) { throw "[directionOfSVGLine] expected epsilon to be a number > 0"; }
        if (!minlen) { throw "[directionOfSVGLine] expected minlen to be a number > 0"; }

        var deltax = line.x2.baseVal.value - line.x1.baseVal.value;
        var deltay = line.y2.baseVal.value - line.y1.baseVal.value;
        if ( Math.abs(deltax) < epsilon && Math.abs(deltay) > minlen )
            // vertical
            if (deltay > 0)     return 'DOWN';
            else                return 'UP';
        else if ( Math.abs(deltay) < epsilon && Math.abs(deltax) > minlen )
            // horizontal
            if (deltax > 0)     return 'RIGHT';
            else                return 'LEFT';
        else if (deltay < -minlen)
            // UP
            if      (deltax > minlen) return 'UP-RE';
            else if (deltax < -minlen) return 'UP-LE';
            else throw "Unklar, me and logic :-)";
        else if (deltay > minlen)
            // DOWN
            if      (deltax > minlen) return 'DO-RE';
            else if (deltax < -minlen) return 'DO-LE';
            else throw "Unklar, me and logic :-)";
        else throw "This shoudl never happen, or, me and logic :-)";
    },

    directionOfPolyAngle: function (polyline, epsilon, minlen) {
        if (!(polyline instanceof SVGPolylineElement)) { throw "[directionOfSVGLine] expected line element."; }
        if (!epsilon) { throw "[directionOfSVGLine] expected epsilon to be a number > 0"; }
        if (!minlen) { throw "[directionOfSVGLine] expected minlen to be a number > 0"; }
        var debug = true;
        if (debug) console.log("directionOfPolyAngle: line, epsilon, minlen", polyline, epsilon, minlen);
        var coords = polyline.getAttribute("points").trim().split(/[\s,]+/);
        if (coords.length != 6) throw "[directionOfSVGLine] expected 3 points (6 coordinates)."+coords.length+polyline.getAttribute("points").trim();

        var absdeltax = Math.abs(coords[0] - coords[4]);
        var absdeltay = Math.abs(coords[1] - coords[5]);
        if (absdeltax < epsilon && absdeltay > minlen)
            // pointing left or right
            if (coords[0] - coords[2] > minlen) return 'LEFT';
            else if (coords[0] - coords[2] < -minlen) return 'RIGHT';
            else throw "[directionOfPolyAngle] Angle to flat (l/r). "+coords;
        else if (absdeltay < epsilon && absdeltax > minlen)
            // pointing up or down
            if (coords[1] - coords[3] > minlen) return 'UP';
            else if (coords[1] - coords[3] < -minlen) return 'DOWN';
            else throw "[directionOfPolyAngle] Angle to flat (u/d). "+coords;
        else throw "[directionOfPolyAngle] Direction not detectable as left, right, up, down.";
    }
}
