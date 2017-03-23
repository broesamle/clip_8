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

var checkIntersection = function (x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x2 < x1 + w1 && x1 < x2 + w2 && y2 < y1 + h1)
        return y1 < y2 + h2;
    else return false;
}

var checkEnclosure = function (x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x1 <= x2 && x1+w1 >= x2+w2 &&
        y1 <= y2 )
        return y1+h1 >= y2+h2;
    else return false;
}

var checkOverlapRectEls = function (r1, r2, oversectinterlap) {
    return oversectinterlap(
        r1.x.baseVal.value,
        r1.y.baseVal.value,
        r1.width.baseVal.value,
        r1.height.baseVal.value,
        r2.x.baseVal.value,
        r2.y.baseVal.value,
        r2.width.baseVal.value,
        r2.height.baseVal.value
    );
}

var newRectEl_fromPoints = function (x1, y1, x2, y2) {
    return Svgdom.newRectElement_fromSVGRect ( Svgdom.newSVGRect_fromPoints({x: x1, y: y1}, {x: x2, y: y2}) );
}

describe("retrieveEnclosedRectangles: test query rects q against one fixed test rect element t; vertical main direction.", function() {
    var svgroot;
    var q = undefined;
    var t = undefined;
    beforeEach(function() {
        svgroot = document.getElementById("svgroot1");
        while (svgroot.firstChild) {
            svgroot.removeChild(svgroot.firstChild);
        }
        svgroot.setAttribute("width", 300);
        svgroot.setAttribute("height", 300);
        Svgdom.init(svgroot);
        // create a test rect
        t = newRectEl_fromPoints(50, 50, 150, 250);
        svgroot.appendChild(t);
        Svgretrieve.init(svgroot);
    });

    var testOverlapConditions = function () {
        // test different horizontal conditions
        it("t should not be retrieved when q is above", function () {
            // q horiz. encloses t
            q = newRectEl_fromPoints(0, 25, 350, 35);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q to the left
            q = newRectEl_fromPoints(0, 25, 10, 35);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q horiz. overlaps from the left
            q = newRectEl_fromPoints(0, 25, 80, 35);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q horiz. contained in t
            q = newRectEl_fromPoints(60, 25, 80, 35);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q horiz. overlaps t from the right
            q = newRectEl_fromPoints(100, 25, 300, 35);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q to the right of t
            q = newRectEl_fromPoints(200, 25, 300, 35);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
        });
        it("t should not be retrieved when q is below", function () {
            // q horiz. encloses t
            q = newRectEl_fromPoints(0, 325, 350, 435);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q to the left
            q = newRectEl_fromPoints(0, 325, 10, 435);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q horiz. overlaps from the left
            q = newRectEl_fromPoints(0, 325, 80, 435);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q horiz. contained in t
            q = newRectEl_fromPoints(60, 325, 80, 435);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q horiz. overlaps t from the right
            q = newRectEl_fromPoints(100, 325, 300, 435);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q to the right of t
            q = newRectEl_fromPoints(200, 325, 300, 435);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
        });
        it("t should be retrieved iff q is on same height and q and t intersect horizontally", function () {
            // q horiz. encloses t
            q = newRectEl_fromPoints(0, 225, 350, 235);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(true);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(1);
            // q to the left
            q = newRectEl_fromPoints(0, 225, 10, 235);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q horiz. overlaps from the left
            q = newRectEl_fromPoints(0, 225, 80, 235);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(true);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(1);
            // q horiz. contained in t
            q = newRectEl_fromPoints(60, 225, 80, 235);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(true);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(1);
            // q horiz. overlaps t from the right
            q = newRectEl_fromPoints(100, 225, 300, 235);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(true);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(1);
            // q to the right of t
            q = newRectEl_fromPoints(200, 225, 300, 235);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
        });

        // test different vertical conditions
        it("t should not be retrieved when q is to the left", function () {
            // q vertically encloses t
            q = newRectEl_fromPoints(0, 20, 10, 300);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q above t
            q = newRectEl_fromPoints(0, 20, 10, 30);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q vertically overlaps from top
            q = newRectEl_fromPoints(0, 20, 10, 70);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q vertically contained in t
            q = newRectEl_fromPoints(0, 70, 10, 90);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q vertically overlaps t from below
            q = newRectEl_fromPoints(0, 100, 10, 300);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q to the right of t
            q = newRectEl_fromPoints(0, 280, 10, 300);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
        });

        it("t should not be retrieved when q is to the right", function () {
            // q vertically encloses t
            q = newRectEl_fromPoints(400, 20, 410, 300);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q above t
            q = newRectEl_fromPoints(400, 20, 410, 30);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q vertically overlaps from top
            q = newRectEl_fromPoints(400, 20, 410, 70);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q vertically contained in t
            q = newRectEl_fromPoints(400, 70, 410, 90);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q vertically overlaps t from below
            q = newRectEl_fromPoints(400, 100, 410, 300);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q to the right of t
            q = newRectEl_fromPoints(400, 280, 410, 300);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
        });

        it("t should be retrieved iff q is at same horiz. position and q and t intersect vertically", function () {
            // q vertically encloses t
            q = newRectEl_fromPoints(70, 20, 80, 300);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(true);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(1);
            // q above t
            q = newRectEl_fromPoints(70, 20, 80, 30);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
            // q vertically overlaps from top
            q = newRectEl_fromPoints(70, 20, 80, 70);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(true);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(1);
            // q vertically contained in t
            q = newRectEl_fromPoints(70, 70, 80, 90);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(true);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(1);
            // q vertically overlaps t from below
            q = newRectEl_fromPoints(70, 100, 80, 300);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(true);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(1);
            // q to the right of t
            q = newRectEl_fromPoints(70, 280, 80, 300);
            expect(checkOverlapRectEls(q,t, checkIntersection)).toBe(false);
            expect(Svgretrieve.getIntersectingRectangles(q).length).toBe(0);
        });
    }
    describe("for a more horizontal viewBox", function() {
        beforeEach(function () {
            svgroot.setAttribute("viewBox", "-150 -150 310 290")
        });
        testOverlapConditions();
    });
    describe("for a more vertical viewBox", function() {
        beforeEach(function () {
            svgroot.setAttribute("viewBox", "-150 -150 290 310")
        });
        testOverlapConditions();
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

    it("should return zero elements when no rectangle is present", function () {
        var result = Svgretrieve.getIntersectingRectangles ( Svgdom.newRectElement_fromSVGRect(rndSVGRect()) );
        expect(result.length).toBe(0);
    });

    it("queries should meet the expectation for random rect elements", function() {
        var QRECT_NUM = 1;
        var RECT_NUM = 30;
        var qrects = [];
        var expectation = [];
        var newrect, newrectelement, newexpectation, rectundertest;
        for (var j=0; j<QRECT_NUM; j++) {
            qrects[j] = Svgdom.newRectElement_fromSVGRect(rndSVGRect());
            expectation[j] = [];
        }
        for (var i=0; i<RECT_NUM; i++) {
            newrect = rndSVGRect();
            newrectelement = Svgdom.newRectElement_fromSVGRect(newrect);
            newrectelement.setAttribute("id", String(i));
            svgroot.appendChild(newrectelement);
        }
        Svgretrieve.registerRectElements_fromDOM();
        for (var j=0; j<QRECT_NUM; j++) {
            for (var i=0; i<RECT_NUM; i++) {
                rectundertest = svgroot.getElementById(String(i));
                newexpectation = checkIntersection(
                    qrects[j].x.baseVal.value,
                    qrects[j].y.baseVal.value,
                    qrects[j].width.baseVal.value,
                    qrects[j].height.baseVal.value,
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
