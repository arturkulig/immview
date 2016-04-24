import Queue from '../src/Queue';

describe('Queue', () => {
    it('exists', () => {
        expect(typeof Queue).toBeTruthy();
    });

    it('creates a runnable command', () => {
        let test = false;
        const d = {
            testCmd: () => {
                test = true;
            },
        };
        const command = Queue.createAction(d.testCmd);
        command();
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
        const command = Queue.createAction(d.secondTestCmd, d);
        command();
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
            cmd1: Queue.createAction(commands.cmd1, commands),
            cmd2: Queue.createAction(commands.cmd2, commands),
            cmd3: Queue.createAction(commands.cmd3, commands),
        };

        queueableCommands.cmd1();
        queueableCommands.cmd3();

        expect(testString).toBe('1231');

    });

    it('passes arguments', () => {
        let test = 'c';
        const action = appendix => test += appendix;
        const command = Queue.createAction(action);
        command('asd');
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
        const ctxStartAction = Queue.createAction(startAction, ctx);
        const ctxStartActionCancellingOut = Queue.createAction(startActionCancellingOut, ctx);
        const ctxNestedAction = Queue.createAction(nestedAction, ctx);

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

        Queue.runInQueue(
            action,
            null,
            null
        );
        done();
    });
});
