import Data from '../src/Data.js';
import Scan from '../src/Scan.js';

describe('Scan', () => {
    it('can be created', () => {
        expect(
            () => new Scan()
        ).toThrow();

        const source = new Data(1);
        expect(
            () => new Scan(source)
        ).not.toThrow();
    });

    it('will create initial history with no value', () => {
        const source = new Data(1);
        const history = new Scan(source);

        expect(history.read().length).toEqual(1);
        expect(history.read()[0]).toEqual(1);
    });

    it('will create initial history with a value', () => {
        const source = new Data(1);
        const history = new Scan(source, 3);

        expect(history.read().length).toEqual(1);
        expect(history.read()[0]).toEqual(1);

        source.write(2);
        source.write(3);
        source.write(4);

        expect(history.read().length).toEqual(3);
        expect(history.read()[0]).toEqual(2);
        expect(history.read()[1]).toEqual(3);
        expect(history.read()[2]).toEqual(4);
    });

    it('will create initial history with a value and more steps to remember', () => {
        const source = new Data(1);
        const history = new Scan(source, 3, 0);

        expect(history.read().length).toEqual(3);
        expect(history.read()[0]).toEqual(0);
        expect(history.read()[1]).toEqual(0);
        expect(history.read()[2]).toEqual(1);

        source.write(2);
        source.write(3);
        source.write(4);

        expect(history.read().length).toEqual(3);
        expect(history.read()[0]).toEqual(2);
        expect(history.read()[1]).toEqual(3);
        expect(history.read()[2]).toEqual(4);
    });
});
