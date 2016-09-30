function clip8getClassListSVG(el) {
    return el.getAttributeNS(null, "class").split(' ');
}

function clip8envokeOperation() {
    var svgroot = document.getElementById("clip8svgroot");
    console.log("clip8envokeOperation:", svgroot);
    if (!(svgroot instanceof SVGElement)) { throw "[clip8] no SVG root."; }
    var oper = [];
    for ( var i = 0; i < svgroot.childNodes.length; i++ ) {
        if ( svgroot.childNodes[i] instanceof Element && svgroot.childNodes[i].classList.contains("clip8OP") ) {
            oper.push(svgroot.childNodes[i]);
        }
    }
    if (oper.length == 0) { throw "clip8: no operation found."; }
    for ( var i = 0; i < oper.length; i++ ) {
        svgroot.removeChild(oper[i]);
    }
}