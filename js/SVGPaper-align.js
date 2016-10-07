/** Align SVG elemangles.
*/

function alignLeft_SVGElement(left, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+el.constructor.name; }
    elem.setAttributeNS(null,"x",left);
    return elem;
}

function alignRight_SVGElement(right, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+el.constructor.name; }
    elem.x = right-elem.width;
    return elem;
}

function alignTop_SVGElement(toppp, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+el.constructor.name; }
    elem.y = toppp;
    return elem;
}

function alignBottom_SVGElement(bottom, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+el.constructor.name; }
    elem.y = bottom-elem.height;
    return elem;
}

function alignrelLeft_SVGElements (elems) {
    console.log("alignrelLeft_SVGElements:", elems);
    var left = elems[elems.length-1].x.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
    // find minimum x coordinate
    for ( var i = 0; i < elems.length; i++)
        if (left > elems[i].x.baseVal.value) left = elems[i].x.baseVal.value;
    console.log("left", left);
    for ( var i = 0; i < elems.length; i++)
        alignLeft_SVGElement(left, elems[i]);
}
