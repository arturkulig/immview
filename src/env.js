//@flow

let env: string;

try {
    env = ((): string => process.env.NODE_ENV || 'production')();
} catch (e) {
    env = 'production';
}

export default env;
