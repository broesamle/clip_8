function clip8directionOfSVGLine(line, epsilon, minlen) {
    if (!(line instanceof SVGLineElement)) { throw "[clip8directionOfSVGLine] expected line element."; }
    if (!epsilon) { throw "[clip8directionOfSVGLine] expected epsilon to be a number > 0"; }
    if (!minlen) { throw "[clip8directionOfSVGLine] expected minlen to be a number > 0"; }

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
    else throw "[clip8] Direction of non-vertical or non-horizontal lines not implemented.";
}

function clip8countTags(parentelement, tagnames) {
    /** How many child elements are present for a list of tagnames.
    *   `tagnames` is a list of strings, each element representing a tagname to count.
    *   Returns a list of integers, each element representing the count of the corresponding tagname in `tagnames`.
    */
    var debug = false;
    var result = [];
    var currenttagname, currentcount;
    for ( var j = 0; j < tagnames.length; j++ ) {
        currenttagname = tagnames[j];
        currentcount = 0;
        for ( var i = 0; i < parentelement.childNodes.length; i++ ) {
            if (debug) console.log("clip8countTags: search for", currenttagname, "==",parentelement.childNodes[i].tagName);
            if (parentelement.childNodes[i].tagName == currenttagname) currentcount++;
        }
        if (debug) console.log("clip8countTags: count", currentcount);
        result.push(currentcount);
    }
    return result;
}
