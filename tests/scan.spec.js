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
        expect(history.read()).toEqual([1]);
    });

    it('will create initial history with a value', () => {
        const source = new Data(1);
        const history = new Scan(source, 3);
        expect(history.read()).toEqual([1]);
        source.write(2);
        source.write(3);
        source.write(4);
        expect(history.read()).toEqual([2, 3, 4]);
    });

    it('will create initial history with a value and more steps to remember', () => {
        const source = new Data(1);
        const history = new Scan(source, 3, 0);
        source.write(2);
        source.write(3);
        source.write(4);
        expect(history.read()).toEqual([2, 3, 4]);
    });
});
