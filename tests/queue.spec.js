import Queue from '../src/Queue';

describe('Queue', function() {
    it('exists', function() {
        expect(typeof Queue).toBeTruthy();
    });

    it('creates a runnable command', function() {
        let test = false;
        let d = {
            testCmd: () => {
                test = true;
            },
        };
        let command = Queue.createAction(d.testCmd);
        command();
        expect(test).toBeTruthy();
    });

    it('creates a runnable context command', function() {
        let test = false;
        let d = {
            testCmd: () => {
                console.log('testCmd');
                test = true;
            },

            secondTestCmd: function() {
                console.log('secondTestCmd');
                this.testCmd();
            },
        };
        let command = Queue.createAction(d.secondTestCmd, d);
        command();
        expect(test).toBeTruthy();
    });

    it('runs commands separately in call order', function() {
        let testString = '';
        let commands = {
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
        let queueableCommands = {
            cmd1: Queue.createAction(commands.cmd1, commands),
            cmd2: Queue.createAction(commands.cmd2, commands),
            cmd3: Queue.createAction(commands.cmd3, commands),
        };

        queueableCommands.cmd1();
        queueableCommands.cmd3();

        expect(testString).toBe('1231');

    });

    it('passes arguments', function() {
        let test = 'c';
        let action = appendix => test += appendix;
        let command = Queue.createAction(action);
        command('asd');
        expect(test).toBe('casd');
    });

    it('removes unused context', function() {
        let test;
        const startAction = () => {
            contextNestedAction();
            contextNestedAction();
        };
        const startActionCancellingOut = () => {
            contextNestedAction();
            contextNestedAction();
            Queue.rejectContext(context);
        };
        const nestedAction = () => test += 'c';
        const context = {};
        const contextStartAction = Queue.createAction(startAction, context);
        const contextStartActionCancellingOut = Queue.createAction(startActionCancellingOut, context);
        const contextNestedAction = Queue.createAction(nestedAction, context);

        test = '';
        contextStartAction();
        expect(test).toBe('cc');

        test = '';
        contextStartActionCancellingOut();
        expect(test).toBe('');
    });
});