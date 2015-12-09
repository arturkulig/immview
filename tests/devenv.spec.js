describe("test env", function () {
    var {Data, View} = immview;
    it("works", function () {
        expect(Immutable).toBeDefined();
        expect(Data).toBeDefined();
        expect(View).toBeDefined();
    });
});
