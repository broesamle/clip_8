function clip8envokeOperation() {
    var svgroot = document.getElementById("clip8svgroot");
    console.log("clip8envokeOperation:", svgroot);
    if (! (svgroot instanceof SVGElement)) { throw "[clip8] no SVG root."; }
}