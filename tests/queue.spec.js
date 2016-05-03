import Queue from '../src/Queue';

describe('Queue', () => {
    it('exists', () => {
        expect(typeof Queue).toBeTruthy();
    });

    it('runs a command', () => {
        let test = false;
        const testCmd = () => {
            test = true;
        };

        Queue.runInQueue(1, testCmd);
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

        Queue.runInQueue(1, d.secondTestCmd, d);
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
            cmd1: () => Queue.runInQueue(1, commands.cmd1, commands),
            cmd2: () => Queue.runInQueue(1, commands.cmd2, commands),
            cmd3: () => Queue.runInQueue(1, commands.cmd3, commands),
        };

        queueableCommands.cmd1();
        queueableCommands.cmd3();

        expect(testString).toBe('1231');

    });

    it('passes arguments', () => {
        let test = 'c';
        const action = appendix => test += appendix;
        Queue.runInQueue(1, action, null, ['asd']);
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
            Queue.rejectContext(ctx);
        };

        const nestedAction = () => test += 'c';
        const ctx = {};
        const ctxStartAction = () => Queue.runInQueue(1, startAction, ctx);
        const ctxStartActionCancellingOut = () => {
            Queue.runInQueue(1, startActionCancellingOut, ctx);
        };

        const ctxNestedAction = () => Queue.runInQueue(1, nestedAction, ctx);

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

        Queue.runInQueue(1, action);
        done();
    });

    it('prioritizes', () => {
        let test = '';
        Queue.runInQueue(1, () => {
            Queue.runInQueue(1, () => test += 'b');
            Queue.runInQueue(1, () => test += 'c');
            Queue.runInQueue(2, () => test += 'a');
        });
        expect(test).toBe('abc');
    });
});
