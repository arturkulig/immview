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
        let command = Queue.createCommand(d.testCmd);
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
        let command = Queue.createCommand(d.secondTestCmd, d);
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
            cmd1: Queue.createCommand(commands.cmd1, commands),
            cmd2: Queue.createCommand(commands.cmd2, commands),
            cmd3: Queue.createCommand(commands.cmd3, commands),
        };

        queueableCommands.cmd1();
        queueableCommands.cmd3();

        expect(testString).toBe('1231');

    });

    it('passes arguments', function() {
        let test = 'c';
        let action = appendix => test += appendix;
        let command = Queue.createCommand(action);
        command('asd');
        expect(test).toBe('casd');
    });
});
