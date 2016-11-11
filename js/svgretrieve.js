"use strict";

function svgretrieve_selectorFromRect(rect, svgcontainer) {
    /** Derive a enclosure/intersection rectangle from a DOM rect element.
    *   FIXME: Handle svg viewBox attributes with x, y != 0
    */
    var debug = false;
    // collecting all trafos reversely (child to parent)
    var trafos = [];
    var tra;
    var el = rect;
    while (el != svgcontainer) {
        if (el && el.transform.baseVal.numberOfItems > 0) {
            for ( var i = el.transform.baseVal.numberOfItems-1; i >= 0; i-- ) {
                tra = el.transform.baseVal.getItem(i).matrix;
                trafos.push(tra);
            }
        }
        el = el.parentElement;
        if      (!el)   console.log("!! NO ELEMENT!", el);
        else if (debug) console.log("newParent:", el);
    }
    // make p1 and p2 the edges of rect
    var p1 = svgcontainer.createSVGPoint();
    var p2 = svgcontainer.createSVGPoint();
    p1.x = rect.x.baseVal.value;
    p1.y = rect.y.baseVal.value;
    p2.x = p1.x + rect.width.baseVal.value;
    p2.y = p1.y + rect.height.baseVal.value;
    // apply all trafos to p1, p2
    for (var i = 0; i < trafos.length; i++) {
        p1 = p1.matrixTransform(trafos[i]);
        p2 = p2.matrixTransform(trafos[i]);
    }
    // turn the points back into a rectangle (depending on the arrangement of `p1, p2`)
    var r = svgcontainer.createSVGRect();
    if (p1.x < p2.x)    { r.x = p1.x; r.width = p2.x - p1.x; }
    else                { r.x = p2.x; r.width = p1.x - p2.x; }
    if (p1.y < p2.y)    { r.y = p1.y; r.height = p2.y - p1.y; }
    else                { r.y = p2.y; r.height = p1.y - p2.y; }
    if (debug) console.log("selector", r);
    return r;
}
