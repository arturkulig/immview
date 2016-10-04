//@flow

import env from './env';

const immutabilizeSecret = '__$immutabilized';

const immutabilize = (
    typeof Proxy !== 'function'
)
    ? (subject: any) => subject
    : (subject: any) => {
        if (
            typeof subject !== 'object' ||
            subject === null ||
            subject === undefined
        ) {
            return subject;
        }
        if (subject[immutabilizeSecret]) {
            return subject;
        }
        return new Proxy(
            subject,
            {
                get: (target, property) =>
                    property === immutabilizeSecret ? true : immutabilize(target[property]),
                set: (target, property, value, receiver) => {
                    if (env === 'production') {
                        return false;
                    }
                    let [isStringified, stringified] = tryStringify(receiver);
                    if (isStringified) {
                        throw new Error([
                            'Immutabilizer: Object',
                            ellipse(stringified),
                            'has been frozen in order to contain side-effects.',
                            'You should not modify this object.',
                        ].join(' '));
                    }
                    throw new Error([
                        'Immutabilizer:',
                        'Unrepresentable object has been frozen in order to contain side-effects.',
                        'You should not modify this object.',
                    ].join(' '));
                },
            }
        );
    };

function tryStringify(subject: any): [boolean, string] {
    try {
        return [true, JSON.stringify(subject)];
    } catch (e) {
        return [false, ''];
    }
}

function ellipse(subject = '', length = 32): string {
    return subject.length > length
        ? `${subject.substr(0, 29).replace(/\r/g, '').replace(/\n/g, '')}...`
        : subject;
}

export default immutabilize;
