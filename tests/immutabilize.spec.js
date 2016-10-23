import immutabilize from '../src/Immutabilize';

if (typeof Proxy === 'function') {
    describe('immutabilize', () => {
        it('bypasses already immutable structures', () => {
            [
                0,
                1,
                Number.MAX_SAFE_INTEGER,
                'a',
                undefined,
                null,
            ].forEach(
                v => {
                    expect(immutabilize(v)).toBe(v);
                }
            );
        });

        it('allows reading objects value', () => {
            expect(immutabilize({ a: 1 }).a).toBe(1);
            expect(immutabilize({ a: { a: 1 } }).a.a).toBe(1);
        });

        it('disallows writing objects values', () => {
            expect(() => {
                immutabilize({}).a = 1;
            }).toThrow();
        });

        it('freezes objects inside frozen objects', () => {
            expect(() => {
                immutabilize({ a: {} }).a.a = 1;
            }).toThrow();
        });

        it('allows reading array values', () => {
            expect(immutabilize([1])[0]).toBe(1);
            expect(immutabilize({ a: [1] }).a[0]).toBe(1);
        });

        it('freezes arrays inside frozen objects', () => {
            expect(() => {
                immutabilize([])[0] = 1;
            }).toThrow();
            expect(() => {
                immutabilize([]).push(1);
            }).toThrow();
            expect(() => {
                immutabilize({ a: [] }).a[0] = 1;
            }).toThrow();
        });

        it('prints object on error', () => {
            expect((() => {
                try {
                    immutabilize(
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
                    )[0] = 1;
                } catch (e) {
                    return e;
                }
            })().message).toBe('Immutabilizer: ' +
                'Object [1,2,3,4,5,6,7,8,9,10,11,12,1...' +
                ' has been frozen in order to contain side-effects. ' +
                'You should not modify this object.');
            expect((() => {
                try {
                    immutabilize(
                        [1, 2, 3]
                    )[0] = 1;
                } catch (e) {
                    return e;
                }
            })().message).toBe('Immutabilizer: ' +
                'Object [1,2,3] has been frozen in order' +
                ' to contain side-effects. You should not' +
                ' modify this object.');
        });
    });
}
