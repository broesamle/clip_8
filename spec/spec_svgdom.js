describe("Svgdom", function() {
    var svgroot;
    beforeEach(function(done) {
        svgroot = document.getElementById("svgroot1");
        while (svgroot.firstChild) {
            svgroot.removeChild(svgroot.firstChild);
        }
        svgroot.setAttribute("width", 100);
        svgroot.setAttribute("height", 100);
        svgroot.setAttribute("viewBox", "0 0 100 100");
        Svgdom.init(svgroot);
        done();
    });

    describe("getCornersOfRectPoints_arranged", function() {
        var rndrange = function (min, max) {
            return Math.random()*Math.abs(max-min) + min;
        };
        var rndSVGRect = function () {
            var x1, y1, x2, y2;
            x1 = rndrange(-200,+200);
            y1 = rndrange(-200,+200);
            x2 = rndrange(-200,+200);
            y2 = rndrange(-200,+200);
            return Svgdom.newSVGRect_fromPoints({x: x1, y: y1}, {x: x2, y: y2});
        };
        var rndSVGPoint = function () {
            return Svgdom.newSVGPoint(rndrange(-200,+200), rndrange(-200,+200));
        };
        it("returns the arranged corners as pOrig, pX, pY, pXY for 1000 random rect-point combinations.", function() {
            var rect, point, corners;
            var dist_PointOrig, dist_PointX, dist_PointY, dist_PointXY;
            for (var i = 0; i < 1000; i++) {
                rect = Svgdom.newRectElement_fromSVGRect(rndSVGRect());
                svgroot.appendChild(rect);  // FIXME: cf. #135
                point = rndSVGPoint();
                // pX is offset from pOrig parallel to the X axis.
                // pY is offset from pOrig parallel to the Y axis.
                corners = Svgdom.getCornersOfRectPoints_arranged(point, rect);
                expect(corners.pOrig.y).toEqual(corners.pX.y);
                expect(corners.pOrig.x).toEqual(corners.pY.x);
                expect(corners.pXY.x).toEqual(corners.pX.x);
                expect(corners.pXY.y).toEqual(corners.pY.y);
                dist_PointOrig = Svgdom.euclidDistance(point, corners.pOrig);
                dist_PointX = Svgdom.euclidDistance(point, corners.pX);
                dist_PointY = Svgdom.euclidDistance(point, corners.pY);
                dist_PointXY = Svgdom.euclidDistance(point, corners.pXY);
                expect(dist_PointOrig).toBeLessThan(dist_PointX);
                expect(dist_PointOrig).toBeLessThan(dist_PointY);
                expect(dist_PointOrig).toBeLessThan(dist_PointXY);
                expect(dist_PointX).toBeLessThan(dist_PointXY);
                expect(dist_PointY).toBeLessThan(dist_PointXY);
            }
        });
    });
});
