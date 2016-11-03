"use strict";

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
    console.log("OPS:", oper, oper.length);
    if (oper.length == 0) { throw "clip8: no operation found."; }
    for ( var i = 0; i < oper.length; i++ ) {
        svgroot.removeChild(oper[i]);
    }

    var els = [];
    for ( var i = 0; i < svgroot.childNodes.length; i++ )
        if ( svgroot.childNodes[i] instanceof SVGElement )
            els.push(svgroot.childNodes[i]);
    console.log("ELS:", els, els.length);

    if ( oper[0].classList.contains("clip8alignrel") ) {
        if (!(oper[0] instanceof SVGLineElement)) { throw "[clip8] OP alignrel must be SVGLineElement."; }
        switch (clip8directionOfSVGLine(oper[0])) {
            case "top":     paperclip_alignrelTop(els); break;
            case "bottom":  paperclip_alignrelBottom(els); break;
            case "left":    paperclip_alignrelLeft(els); break;
            case "right":   paperclip_alignrelRight(els); break;
        }
    }
    else if ( oper[0].classList.contains("clip8cut") ) {
        throw "clip8cut not implemented.";
    }
}
