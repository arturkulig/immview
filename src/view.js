class View {
    constructor() {
        this.reactors = [];
        this.lastValue = undefined; //yet declared
    }

    select(process) {
        var newReactor = new View(process);
        this.reactors.push(newReactor);
        return newReactor;
    }

    process() {
        throw new Error("override");
    }

    digest(data) {
        var newValue = this.process(data);
        if (newValue !== this.lastValue) {
            this.flush(this.lastValue = newValue);
        }
    }

    flush(data) {
        this.reactors.map(reactor => reactor.digest(data));
    }
}

module.exports = View;
