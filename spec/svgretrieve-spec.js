describe("getIntersectedElements", function() {
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
            hitlist = Svgretrieve.getIntersectedElements(arearect, svgroot);
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
        Svgretrieve.init(svgroot);
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
describe("retrieveEnclosedRectangles", function() {
    var svgroot;
    beforeEach(function() {
        svgroot = document.getElementById("svgroot1");
        while (svgroot.firstChild) {
            svgroot.removeChild(svgroot.firstChild);
        }
        svgroot.setAttribute("width", 300);
        svgroot.setAttribute("height", 300);
        svgroot.setAttribute("viewBox", "-150 -150 300 300");
        Svgdom.init(svgroot);
        Svgretrieve.init(svgroot);
    });

    var rndSVGRect = function () {
        var x1, y1, x2, y2;
        var rndrange = function (min, max) {
            return Math.random()*Math.abs(max-min) + min;
        }
        x1 = rndrange(-100,+100);
        y1 = rndrange(-100,+100);
        x2 = rndrange(-100,+100);
        y2 = rndrange(-100,+100);
        return Svgdom.newSVGRect_fromPoints({x: x1, y: y1}, {x: x2, y: y2});
    };

    var checkIntersection = function (x1, y1, w1, h1, x2, y2, w2, h2) {
        if (x2 < x1 + w1 && x1 < x2 + w2 && y2 < y1 + h1)
            return y1 < y2 + h2;
        else return false;
    };

    it("should return zero elements when no rectangle is present", function () {
        var result = Svgretrieve.getIntersectingRectangles (rndSVGRect());
        expect(result.length).toBe(0);
    });

    it("queries should meet the expectation for random rect elements", function() {
        var QRECT_NUM = 1;
        var RECT_NUM = 30;
        var qrects = [];
        var expectation = [];
        var newrect, newrectelement, newexpectation, rectundertest;
        for (var j=0; j<QRECT_NUM; j++) {
            qrects[j] = rndSVGRect();
            expectation[j] = [];
            newrectelement = Svgdom.newRectElement_fromSVGRect(qrects[j]);
        }
        for (var i=0; i<RECT_NUM; i++) {
            newrect = rndSVGRect();
            newrectelement = Svgdom.newRectElement_fromSVGRect(newrect);
            newrectelement.setAttribute("id", String(i));
            svgroot.appendChild(newrectelement);
        }
        for (var j=0; j<QRECT_NUM; j++) {
            for (var i=0; i<RECT_NUM; i++) {
                rectundertest = svgroot.getElementById(String(i));
                newexpectation = checkIntersection(
                    qrects[j].x,
                    qrects[j].y,
                    qrects[j].width,
                    qrects[j].height,
                    rectundertest.x.baseVal.value,
                    rectundertest.y.baseVal.value,
                    rectundertest.width.baseVal.value,
                    rectundertest.height.baseVal.value);
                console.debug("qrects, j, rect, i, newexpectation",
                    qrects[j], j, rectundertest, i, newexpectation);
                expectation[j][i] = newexpectation;
            }
        }
        var retrievedlist, retrievedids;
        for (var j=0; j<QRECT_NUM; j++) {
            retrievedlist = Svgretrieve.getIntersectingRectangles(qrects[j]);
            retrievedids = {};
            // make a dict with all retrieved ids
            for (var k=0; k<retrievedlist.length; k++)
                retrievedids[retrievedlist[k].getAttribute("id")] = true;
            // for every id, check the expectation according to presence/absence
            for (var i=0; i<RECT_NUM; i++) {
                if (retrievedids[String(i)])
                    expect(expectation[j][i]).toBe(true);
                else
                    expect(expectation[j][i]).toBe(false);
            }
        }
    });
});
