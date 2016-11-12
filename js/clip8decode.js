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
