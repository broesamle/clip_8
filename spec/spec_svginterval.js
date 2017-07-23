describe("checkIntervalIntersection", function() {
    // disjoint
    it("should return false for:   a1----a2    b1----b2", function () {
        var a = [-4,-2];
        var b = [ 0, 2];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(false);
        expect(Svginterval.checkIntervalIntersection(b, a)).toBe(false);
    });
    it("should return false for:   a2----a1    b1----b2", function () {
        var a = [-2, -4];
        var b = [ 0,  2];
        expect(Svginterval.checkIntervalIntersection(a,b)).toBe(false);
        expect(Svginterval.checkIntervalIntersection(b,a)).toBe(false);
    });
    it("should return false for:   a1----a2    b2----b1", function () {
        var a = [-4,-2];
        var b = [ 2, 1];
        expect(Svginterval.checkIntervalIntersection(a,b)).toBe(false);
        expect(Svginterval.checkIntervalIntersection(b,a)).toBe(false);
    });
    it("should return false for:   a2----a1    b2----b1", function () {
        var a = [-2,-4];
        var b = [ 2, 0];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(false);
        expect(Svginterval.checkIntervalIntersection(b, a)).toBe(false);
    });
    // overlap but not enclosed
    it("should return true  for:   a1----b1====a2----b2", function () {
        var a = [-4, 1];
        var b = [ 0, 2];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(true);
        expect(Svginterval.checkIntervalIntersection(b, a)).toBe(true);
    });
    it("should return true  for:   a2----b1====a1----b2", function () {
        var a = [ 1,-4];
        var b = [ 0, 2];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(true);
        expect(Svginterval.checkIntervalIntersection(b, a)).toBe(true);
    });
    it("should return true  for:   a1----b2====a2----b1", function () {
        var a = [-4, 1];
        var b = [ 2, 0];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(true);
        expect(Svginterval.checkIntervalIntersection(b, a)).toBe(true);
    });
    it("should return true  for:   a2----b2====a1----b1", function () {
        var a = [1,-4];
        var b = [2, 0];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(true);
        expect(Svginterval.checkIntervalIntersection(b, a)).toBe(true);
    });
    // enclosed
    it("should return true  for:   a1----b1====b2----a2", function () {
        var a = [-4, 2];
        var b = [ 0, 1];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(true);
        expect(Svginterval.checkIntervalIntersection(b, a)).toBe(true);
    });
    it("should return true  for:   a2----b1====b2----a1", function () {
        var a = [ 2,-4];
        var b = [ 0, 1];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(true);
        expect(Svginterval.checkIntervalIntersection(b, a)).toBe(true);
    });
    it("should return true  for:   a1----b2====b1----a2", function () {
        var a = [-4, 2];
        var b = [ 1, 0];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(true);
        expect(Svginterval.checkIntervalIntersection(b, a)).toBe(true);
    });
    it("should return true  for:   a2----b2====b1----a1", function () {
        var a = [2,-4];
        var b = [1, 0];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(true);
        expect(Svginterval.checkIntervalIntersection(b, a)).toBe(true);
    });
    // equal
    it("should return true for two equal intervals", function () {
        var a = [1, 4];
        var b = [1, 4];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(true);
        var c = [4, 1];
        var d = [4, 1];
        expect(Svginterval.checkIntervalIntersection(a, b)).toBe(true);
    });
});

describe("checkIntervalEnclosure", function() {
    // disjoint
    it("should return false for:   a1----a2    b1----b2", function () {
        var a = [-4,-2];
        var b = [ 0, 2];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(false);
        expect(Svginterval.checkIntervalEnclosure(b, a)).toBe(false);
    });
    it("should return false for:   a2----a1    b1----b2", function () {
        var a = [-2, -4];
        var b = [ 0,  2];
        expect(Svginterval.checkIntervalEnclosure(a,b)).toBe(false);
        expect(Svginterval.checkIntervalEnclosure(b,a)).toBe(false);
    });
    it("should return false for:   a1----a2    b2----b1", function () {
        var a = [-4,-2];
        var b = [ 2, 1];
        expect(Svginterval.checkIntervalEnclosure(a,b)).toBe(false);
        expect(Svginterval.checkIntervalEnclosure(b,a)).toBe(false);
    });
    it("should return false for:   a2----a1    b2----b1", function () {
        var a = [-2,-4];
        var b = [ 2, 0];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(false);
        expect(Svginterval.checkIntervalEnclosure(b, a)).toBe(false);
    });
    // overlap but not enclosed
    it("should return false for:   a1----b1====a2----b2", function () {
        var a = [-4, 1];
        var b = [ 0, 2];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(false);
        expect(Svginterval.checkIntervalEnclosure(b, a)).toBe(false);
    });
    it("should return false for:   a2----b1====a1----b2", function () {
        var a = [ 1,-4];
        var b = [ 0, 2];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(false);
        expect(Svginterval.checkIntervalEnclosure(b, a)).toBe(false);
    });
    it("should return false for:   a1----b2====a2----b1", function () {
        var a = [-4, 1];
        var b = [ 2, 0];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(false);
        expect(Svginterval.checkIntervalEnclosure(b, a)).toBe(false);
    });
    it("should return false for:   a2----b2====a1----b1", function () {
        var a = [1,-4];
        var b = [2, 0];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(false);
        expect(Svginterval.checkIntervalEnclosure(b, a)).toBe(false);
    });
    // enclosed
    it("a should enclose b but b should not enclose a for:   a1----b1====b2----a2", function () {
        var a = [-4, 2];
        var b = [ 0, 1];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(true);
        expect(Svginterval.checkIntervalEnclosure(b, a)).toBe(false);
    });
    it("a should enclose b but b should not enclose a for:   a2----b1====b2----a1", function () {
        var a = [ 2,-4];
        var b = [ 0, 1];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(true);
        expect(Svginterval.checkIntervalEnclosure(b, a)).toBe(false);
    });
    it("a should enclose b but b should not enclose a for:   a1----b2====b1----a2", function () {
        var a = [-4, 2];
        var b = [ 1, 0];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(true);
        expect(Svginterval.checkIntervalEnclosure(b, a)).toBe(false);
    });
    it("a should enclose b but b should not enclose a for:   a2----b2====b1----a1", function () {
        var a = [2,-4];
        var b = [1, 0];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(true);
        expect(Svginterval.checkIntervalEnclosure(b, a)).toBe(false);
    });
    // equal
    it("should return true for two equal intervals", function () {
        var a = [1, 4];
        var b = [1, 4];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(true);
        var c = [4, 1];
        var d = [4, 1];
        expect(Svginterval.checkIntervalEnclosure(a, b)).toBe(true);
    });
});
