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
        expect(history.read().toJS()).toEqual([1]);
    });

    it('will create initial history with a value', () => {
        const source = new Data(1);
        const history = new Scan(source, 0);
        expect(history.read().toJS()).toEqual([0, 1]);
    });

    it('will create initial history with a value and more steps to remember', () => {
        const source = new Data(1);
        const history = new Scan(source, 0, 3);
        expect(history.read().toJS()).toEqual([0, 0, 1]);
    });

    it('will frame previous steps', () => {
        const source = new Data(1);
        const history = new Scan(source, null, 4);
        expect(history.read().toJS()).toEqual([1]);
        source.write(2);
        source.write(3);
        source.write(4);
        expect(history.read().toJS()).toEqual([1, 2, 3, 4]);
        source.write(5);
        expect(history.read().toJS()).toEqual([2, 3, 4, 5]);
    });
});
