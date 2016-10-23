import {
    Domain,
    Data,
    Merge,
} from '../src';
import {
    Map,
} from 'immutable';

describe('Merge', () => {

    it('can be created from a Data', () => {
        const aData = new Data(Map({ a: 1 }));
        const resultMerge = new Merge({ aData });

        expect(resultMerge.read().aData.get('a')).toBe(1);
    });

    it('can be created from a Merge', () => {
        const aData = new Data(Map({ a: 1 }));
        const aMerge = new Merge({ aData });
        const resultMerge = new Merge({ aMerge });

        expect(resultMerge.read().aMerge.aData.get('a')).toBe(1);
    });

    it('can be created from a Domain', () => {
        const aData = new Data(Map({ a: 1 }));
        const aDomain = new Domain(aData, {});
        const resultMerge = new Merge({ aDomain, aData });

        expect(resultMerge.read().aDomain.get('a')).toBe(1);
        expect(resultMerge.read().aData.get('a')).toBe(1);
    });

    describe('', () => {
        let aData;
        let aMerge;
        let aMergeReactions;

        beforeEach(() => {
            aData = new Data(1);
            aMergeReactions = 0;
            aMerge = new Merge({ source: aData });
            aMerge.subscribe(() => {
                aMergeReactions++;
            });
        });

        it('can be read from / is a result of processing data', () => {
            expect(aMerge.read().source).toBe(1);
        });

        it('cannot be written to', () => {
            expect(() => aMerge.write(v => v)).toThrow();
        });

        it('is reacting to new data', () => {
            expect(aMerge.read().source).toEqual(1);
            aData.write(v => v + 1);
            expect(aMerge.read().source).toEqual(2);
        });

        it('reacts only to actual changes', () => {
            expect(aMergeReactions).toBe(1);
            aData.write(v => v + 1);
            expect(aMergeReactions).toBe(2);
            aData.write(v => v);
            expect(aMergeReactions).toBe(2);
            aData.write(v => v + 1);
            expect(aMergeReactions).toBe(3);
            aData.write(v => v);
            expect(aMergeReactions).toBe(3);
            aData.write(v => v + 1);
            expect(aMergeReactions).toBe(4);
            expect(aMerge.read().source).toBe(4);
        });
    });
});
