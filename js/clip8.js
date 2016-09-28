function clip8getClassListSVG(el) {
    return el.getAttributeNS(null, "class").split(' ');
}

function clip8envokeOperation() {
    var svgroot = document.getElementById("clip8svgroot");
    console.log("clip8envokeOperation:", svgroot);
    if (! svgroot) throw "FEHLER";
    /*
    var op = svgroot.firstChild;
    console.log("OP", op);
    console.log("OP", op.nextSibling);
    console.log("OP", op.nextSibling.nextSibling);
    while (op = op.nextSibling) {
        console.log("OPw", op);
        x = clip8getClassListSVG(op);
        console.log("OPC", x, x.contains("clip8OP"));
    }
    */
}