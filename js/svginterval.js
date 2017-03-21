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

var Svginterval = {
    checkIntervalIntersection(a, b) {
        return Math.min(a[0], a[1]) <= Math.max(b[0], b[1]) &&
               Math.min(b[0], b[1]) <= Math.max(a[0], a[1]);
    },

    getXIntervalRectElement: function (r) {
        return [r.x.baseVal.value, r.x.baseVal.value+r.width.baseVal.value];
    },

    getYIntervalRectElement: function (r) {
        return [r.y.baseVal.value, r.y.baseVal.value+r.height.baseVal.value];
    }
}
