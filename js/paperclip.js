/** Manipulate SVG Rectangles like pieces of paper or cardboard.
*/

"use strict";

function _paperclip_alignLeft_SVGElement(left, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+elem.constructor.name; }
    elem.setAttributeNS(null,"x",left);
    return elem;
}

function _paperclip_alignRight_SVGElement(right, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+elem.constructor.name; }
    elem.setAttributeNS(null,"x",right-elem.width.baseVal.value);
    return elem;
}

function _paperclip_alignTop_SVGElement(toppp, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+elem.constructor.name; }
    elem.setAttributeNS(null,"y",toppp);
    return elem;
}

function _paperclip_alignBottom_SVGElement(bottom, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+el.constructor.name; }
    elem.setAttributeNS(null,"y",bottom-elem.height.baseVal.value);
    return elem;
}

function paperclip_alignrelLeft (elems) {
    console.log("alignrelLeft:", elems);
    var left = elems[elems.length-1].x.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
    // find minimum x coordinate
    for ( var i = 0; i < elems.length; i++)
        if (left > elems[i].x.baseVal.value) left = elems[i].x.baseVal.value;
    for ( var i = 0; i < elems.length; i++)
        _paperclip_alignLeft_SVGElement(left, elems[i]);
}

function paperclip_alignrelRight (elems) {
    console.log("alignrelLeft:", elems);
    var right = elems[elems.length-1].x.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
    // find maximum x coordinate of all right edges
    for ( var i = 0; i < elems.length; i++)
        if (right < (elems[i].x.baseVal.value+elems[i].width.baseVal.value)) right = elems[i].x.baseVal.value+elems[i].width.baseVal.value;
    for ( var i = 0; i < elems.length; i++)
        _paperclip_alignRight_SVGElement(right, elems[i]);
}

function paperclip_alignrelTop (elems) {
    console.log("alignreltop:", elems);
    var toppp = elems[elems.length-1].y.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
    // find minimum y coordinate
    for ( var i = 0; i < elems.length; i++)
        if (toppp > elems[i].y.baseVal.value) toppp = elems[i].y.baseVal.value;
    for ( var i = 0; i < elems.length; i++)
        _paperclip_alignTop_SVGElement(toppp, elems[i]);
}

function paperclip_alignrelBottom (elems) {
    console.log("alignrelLeft:", elems);
    var bottom = elems[elems.length-1].y.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
    // find maximum y coordinate of all bottom edges
    for ( var i = 0; i < elems.length; i++)
        if (bottom < (elems[i].y.baseVal.value+elems[i].height.baseVal.value)) bottom = elems[i].y.baseVal.value+elems[i].height.baseVal.value;
    for ( var i = 0; i < elems.length; i++)
        _paperclip_alignBottom_SVGElement(bottom, elems[i]);
}
