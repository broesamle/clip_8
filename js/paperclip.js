/** Manipulate SVG Rectangles like pieces of paper or cardboard.
*/

"use strict";

var Paperclip = {

    _alignLeft: function (left, elem) {
        if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+elem.constructor.name; }
        elem.setAttributeNS(null,"x",left);
        return elem;
    },

    _alignRight: function (right, elem) {
        if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+elem.constructor.name; }
        elem.setAttributeNS(null,"x",right-elem.width.baseVal.value);
        return elem;
    },

    _alignTop: function (toppp, elem) {
        if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+elem.constructor.name; }
        elem.setAttributeNS(null,"y",toppp);
        return elem;
    },

    _alignBottom: function (bottom, elem) {
        if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+el.constructor.name; }
        elem.setAttributeNS(null,"y",bottom-elem.height.baseVal.value);
        return elem;
    },

    alignrelLeft: function  (elems) {
        console.log("alignrelLeft:", elems);
        var left = elems[elems.length-1].x.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
        // find minimum x coordinate
        for ( var i = 0; i < elems.length; i++)
            if (left > elems[i].x.baseVal.value) left = elems[i].x.baseVal.value;
        for ( var i = 0; i < elems.length; i++)
            Paperclip._alignLeft(left, elems[i]);
    },

    alignrelRight: function  (elems) {
        console.log("alignrelLeft:", elems);
        var right = elems[elems.length-1].x.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
        // find maximum x coordinate of all right edges
        for ( var i = 0; i < elems.length; i++)
            if (right < (elems[i].x.baseVal.value+elems[i].width.baseVal.value)) right = elems[i].x.baseVal.value+elems[i].width.baseVal.value;
        for ( var i = 0; i < elems.length; i++)
            Paperclip._alignRight(right, elems[i]);
    },

    alignrelTop: function  (elems) {
        console.log("alignreltop:", elems);
        var toppp = elems[elems.length-1].y.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
        // find minimum y coordinate
        for ( var i = 0; i < elems.length; i++)
            if (toppp > elems[i].y.baseVal.value) toppp = elems[i].y.baseVal.value;
        for ( var i = 0; i < elems.length; i++)
            Paperclip._alignTop(toppp, elems[i]);
    },

    alignrelBottom: function  (elems) {
        console.log("alignrelLeft:", elems);
        var bottom = elems[elems.length-1].y.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
        // find maximum y coordinate of all bottom edges
        for ( var i = 0; i < elems.length; i++)
            if (bottom < (elems[i].y.baseVal.value+elems[i].height.baseVal.value)) bottom = elems[i].y.baseVal.value+elems[i].height.baseVal.value;
        for ( var i = 0; i < elems.length; i++)
            Paperclip._alignBottom(bottom, elems[i]);
    },

    // Cut
    cutVertical: function (elems, cutX) {
        for (i = 0; i < elems.length; i++) {
            if ( ! elem instanceof SVGRectElement ) throw "[cutVertical] not implemented for "+elem.constructor.name;

        }
    },

    cutHorizontal: function (elems, cutY) {
        for (i = 0; i < elems.length; i++) {
            if ( ! elem instanceof SVGRectElement ) throw "[cutHorizontal] not implemented for "+elem.constructor.name;

        }
    }
}