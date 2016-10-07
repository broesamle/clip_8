
function clip8directionOfSVGLine(line) {
    if          (line.x1.baseVal.value == line.x2.baseVal.value) {
        // exactly vertical
        if      (line.y1.baseVal.value < line.y2.baseVal.value) return "bottom";
        else if (line.y1.baseVal.value > line.y2.baseVal.value) return "top";
        else throw "[clip8] invalid direction of line (a).";
    } else if   (line.y1.baseVal.value == line.y2.baseVal.value) {
        // exactly horizontal
        if      (line.x1.baseVal.value < line.x2.baseVal.value) return "right";
        else if (line.x1.baseVal.value > line.x2.baseVal.value) return "left";
        else throw "[clip8] invalid direction of line (b).";
    } else throw "[clip8] Direction of non-vertical or non-horizontal lines not implemented.";
    return "vertical"
}
