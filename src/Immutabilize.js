//@flow

import env from './env';

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
        return new Proxy(
            subject,
            {
                get: (target, property) => immutabilize(target[property]),
                set: (target, property, value, receiver) => {
                    if (env === 'production') {
                        return false;
                    }
                    let [isStringified, stringified] = tryStringify(receiver);
                    if (isStringified) {
                        throw new Error([
                            'Immview::immutabilizer: Object',
                            ellipse(stringified),
                            'has been frozen in order to contain side-effects.',
                            'You should not modify this object.',
                        ].join(' '));
                    }
                    throw new Error([
                        'Immview::immutabilizer:',
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
