import {
    createSchedule,
    scheduleJob,
    scheduleLength,
    findJob,
    runScheduledPriorityJob,
    copyQueueOntoSchedule,
} from '../src/streamScheduler';

const graph = [
    ['a', 'b'],
    ['a', 'c'],
    ['b', 'd'],
    ['e', 'a'],
    ['f', 'b'],
];

const indexOf = collection => (picker = v => v) => {
    for (let i = 0; i < collection.length; i++) {
        if (!!picker(collection[i])) {
            return i;
        }
    }
    return null;
};

describe('streamScheduler', () => {
    it('can create schedule', () => {
        const schedule = createSchedule(graph);
        expect(schedule.length).toBe(6);

        const indexOfSchedule = indexOf(schedule);
        const indexOfKey = key => indexOfSchedule(([node]) => node === key);

        expect(indexOfKey('a') > indexOfKey('e')).toBe(true);
        expect(indexOfKey('c') > indexOfKey('f')).toBe(true);
    });

    it('can add a job to schedule', () => {
        const schedule = createSchedule(graph);
        const filledSchedule = scheduleJob('a', 9, schedule);
        expect(
            filledSchedule
                .filter(([key]) => key === 'a')
                [0]
                [1]
        ).toBe(9);
    });

    it('measures queue length', () => {
        const schedule = createSchedule(graph);
        const filledSchedule = scheduleJob('a', 9, schedule);
        expect(scheduleLength(schedule)).toBe(0);
        expect(scheduleLength(filledSchedule)).toBe(1);
    });

    it('finds a job for a node in a queue', () => {
        const schedule = createSchedule(graph);
        const filledSchedule = scheduleJob('a', 9, schedule);
        expect(findJob(schedule, 'a')).toBe(null);
        expect(findJob(filledSchedule, 'a')).toBe(9);
    });

    it('runs a job and returns rest of the queue', () => {
        let test = false;
        const schedule = createSchedule(graph);
        const filledSchedule = scheduleJob('a', () => test = true, schedule);
        const runSchedule = runScheduledPriorityJob(filledSchedule);
        expect(runSchedule).toEqual(schedule);
        expect(test).toBe(true);
    });

    it('copies current scheduled jobs to another schedule', () => {
        const schedule = createSchedule(graph);
        const filledSchedule = scheduleJob('a', 9, schedule);
        const copiedSchedule = copyQueueOntoSchedule(
            filledSchedule.filter(([node, job]) => !!job),
            schedule
        );
        expect(copiedSchedule).toEqual(filledSchedule);
    });

    it('assures proper execution order', () => {
        let test = '';
        let schedule;
        schedule = createSchedule(graph);

        schedule = scheduleJob('c', () => test += '***', schedule);

        schedule = scheduleJob('a', () => test += 'a', schedule);
        schedule = scheduleJob('b', () => test += 'b', schedule);
        schedule = scheduleJob('c', () => test += 'c', schedule);
        schedule = scheduleJob('d', () => test += 'd', schedule);
        schedule = scheduleJob('e', () => test += 'e', schedule);
        schedule = scheduleJob('f', () => test += 'f', schedule);

        while (scheduleLength(schedule)) {
            schedule = runScheduledPriorityJob(schedule);
        }

        expect(test).toBe('feacbd');
    });
});
