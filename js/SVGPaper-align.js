/** Align SVG elements.
*/

function alignLeft_SVGElement(left, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+elem.constructor.name; }
    elem.setAttributeNS(null,"x",left);
    return elem;
}

function alignRight_SVGElement(right, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+elem.constructor.name; }
    elem.setAttributeNS(null,"x",right-elem.width.baseVal.value);
    return elem;
}

function alignTop_SVGElement(toppp, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+elem.constructor.name; }
    elem.setAttributeNS(null,"y",toppp);
    return elem;
}

function alignBottom_SVGElement(bottom, elem) {
    if (!(elem instanceof SVGElement)) { throw "SVGPaper: not implemented for "+el.constructor.name; }
    elem.setAttributeNS(null,"y",bottom-elem.height.baseVal.value);
    return elem;
}

function alignrelLeft_SVGElements (elems) {
    console.log("alignrelLeft_SVGElements:", elems);
    var left = elems[elems.length-1].x.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
    // find minimum x coordinate
    for ( var i = 0; i < elems.length; i++)
        if (left > elems[i].x.baseVal.value) left = elems[i].x.baseVal.value;
    for ( var i = 0; i < elems.length; i++)
        alignLeft_SVGElement(left, elems[i]);
}

function alignrelRight_SVGElements (elems) {
    console.log("alignrelLeft_SVGElements:", elems);
    var right = elems[elems.length-1].x.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
    // find maximum x coordinate of all right edges
    for ( var i = 0; i < elems.length; i++)
        if (right < (elems[i].x.baseVal.value+elems[i].width.baseVal.value)) right = elems[i].x.baseVal.value+elems[i].width.baseVal.value;
    for ( var i = 0; i < elems.length; i++)
        alignRight_SVGElement(right, elems[i]);
}

function alignrelTop_SVGElements (elems) {
    console.log("alignreltop_SVGElements:", elems);
    var toppp = elems[elems.length-1].y.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
    // find minimum y coordinate
    for ( var i = 0; i < elems.length; i++)
        if (toppp > elems[i].y.baseVal.value) toppp = elems[i].y.baseVal.value;
    for ( var i = 0; i < elems.length; i++)
        alignTop_SVGElement(toppp, elems[i]);
}

function alignrelBottom_SVGElements (elems) {
    console.log("alignrelLeft_SVGElements:", elems);
    var bottom = elems[elems.length-1].y.baseVal.value;  // might be undefined if no elems is empty, but then the loops will never run
    // find maximum y coordinate of all bottom edges
    for ( var i = 0; i < elems.length; i++)
        if (bottom < (elems[i].y.baseVal.value+elems[i].height.baseVal.value)) bottom = elems[i].y.baseVal.value+elems[i].height.baseVal.value;
    for ( var i = 0; i < elems.length; i++)
        alignBottom_SVGElement(bottom, elems[i]);
}
