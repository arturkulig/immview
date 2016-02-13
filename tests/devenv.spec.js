describe("test env", function () {
    var {
        Data,
        View,
        Domain,
        } = immview;
    it("works", function () {
        expect(Immutable).toBeDefined();
        expect(Data).toBeDefined();
        expect(View).toBeDefined();
        expect(Domain).toBeDefined();
    });
});
