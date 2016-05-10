import Dispatcher from '../src/Dispatcher';

describe('Dispatcher', () => {
    it('exists', () => {
        expect(typeof Dispatcher).toBeTruthy();
    });

    it('runs a command', () => {
        let test = false;
        const testCmd = () => {
            test = true;
        };

        Dispatcher.dispatch(testCmd);
        expect(test).toBeTruthy();
    });

    it('creates a runnable context command', () => {
        let test = false;

        const d = {
            testCmd: function () {
                test = true;
            },

            secondTestCmd: function () {
                this.testCmd();
            },
        };

        Dispatcher.dispatch(d.secondTestCmd, d);
        expect(test).toBeTruthy();
    });

    it('runs commands separately in call order', () => {
        let testString = '';
        const commands = {
            cmd1: () => {
                testString += '1';
            },

            cmd2: () => {
                testString += '2';
                queueableCommands.cmd1();
                testString += '3';
            },

            cmd3: () => {
                queueableCommands.cmd2();
            },
        };
        const queueableCommands = {
            cmd1: () => Dispatcher.dispatch(commands.cmd1, commands),
            cmd2: () => Dispatcher.dispatch(commands.cmd2, commands),
            cmd3: () => Dispatcher.dispatch(commands.cmd3, commands),
        };

        queueableCommands.cmd1();
        queueableCommands.cmd3();

        expect(testString).toBe('1231');

    });

    it('passes arguments', () => {
        let test = 'c';
        const action = appendix => test += appendix;
        Dispatcher.dispatch(action, null, ['asd']);
        expect(test).toBe('casd');
    });

    it('removes unused context', () => {
        let test;

        const startAction = () => {
            ctxNestedAction();
            ctxNestedAction();
        };

        const startActionCancellingOut = () => {
            ctxNestedAction();
            ctxNestedAction();
            Dispatcher.rejectContext(ctx);
        };

        const nestedAction = () => test += 'c';
        const ctx = {};
        const ctxStartAction = () => Dispatcher.dispatch(startAction, ctx);
        const ctxStartActionCancellingOut = () => {
            Dispatcher.dispatch(startActionCancellingOut, ctx);
        };

        const ctxNestedAction = () => Dispatcher.dispatch(nestedAction, ctx);

        test = '';
        ctxStartAction();
        expect(test).toBe('cc');

        test = '';
        ctxStartActionCancellingOut();
        expect(test).toBe('');
    });

    it('catches action error', done => {
        const action = () => {
            throw new Error('dope!');
        };

        Dispatcher.dispatch(action);
        done();
    });

    it('prioritizes', () => {
        let test = '';
        Dispatcher.dispatch(() => {
            Dispatcher.dispatch(() => test += 'b', null, null, 1);
            Dispatcher.dispatch(() => test += 'c', null, null, 1);
            Dispatcher.dispatch(() => test += 'a', null, null, 2);
        }, null, null, 1);
        expect(test).toBe('abc');
    });
});
