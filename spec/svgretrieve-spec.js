describe("getEnclosedElements", function() {
    var svgroot;

    var putandretrieve_circles = function () {
        var cx, cy, circ, arearect, hitlist;

        for (var i = 0; i<200; i++) {
            expect(svgroot.firstChild).toBe(null);
            cx = Math.random()*100.0;
            cy = Math.random()*100.0;
            circ = document.createElementNS(svgroot.namespaceURI,"circle");
            circ.setAttribute("cx", cx);
            circ.setAttribute("cy", cy);
            circ.setAttribute("fill", "#000000;");
            circ.setAttribute("r", 0.999);
            svgroot.appendChild(circ);

            arearect = svgroot.createSVGRect();
            arearect.x = cx-1.0;
            arearect.y = cy-1.0;
            arearect.width = 2.0;
            arearect.height = 2.0;
            hitlist = Svgretrieve.getEnclosedElements(arearect, svgroot);
            expect(hitlist.length).toBe(1, "to find exactly one circle in the hitlist");
            expect(hitlist[0] instanceof SVGCircleElement).toBe(true, "retrieved element to be instance of SVGCircleElement");
            svgroot.removeChild(svgroot.firstChild);
        }
    };

    beforeEach(function() {
        svgroot = document.getElementById("svgroot1");
        while (svgroot.firstChild) {
            svgroot.removeChild(svgroot.firstChild);
        }
        svgroot.setAttribute("width", 100);
        svgroot.setAttribute("height", 100);
        svgroot.setAttribute("viewBox", "0 0 100 100");
    });

    it("retreives elements from an SVG container", function() {
        expect(svgroot instanceof SVGElement).toBe(true);
        putandretrieve_circles();
    });
    it("retreives elements from a resized SVG container", function() {
        expect(svgroot instanceof SVGElement).toBe(true);
        svgroot.setAttribute("width", 150);
        svgroot.setAttribute("height", 150);
        putandretrieve_circles();
    });
    it("retreives elements from an SVG container with a resized viewBox", function() {
        expect(svgroot instanceof SVGElement).toBe(true);
        svgroot.setAttribute("viewBox", "0 0 60 60");
        putandretrieve_circles();
    });
    it("retreives elements from an SVG container with a moved viewBox", function() {
        expect(svgroot instanceof SVGElement).toBe(true);
        svgroot.setAttribute("viewBox", "10 10 100 100");
        putandretrieve_circles();
    });
    it("retreives elements from an SVG container with a non-trivial viewBox", function() {
        expect(svgroot instanceof SVGElement).toBe(true);
        svgroot.setAttribute("viewBox", "10 10 140 140");
        putandretrieve_circles();
    });
});
