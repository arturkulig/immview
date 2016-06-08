import { Data, View } from '../src';

describe('classes', () => {
    it('can be extended', () => {
        class NonStandardView extends View {
            constructor() {
                super(
                    new Data('a')
                );
            }
        }

        expect(new NonStandardView().read()).toBe('a');
    });
});
