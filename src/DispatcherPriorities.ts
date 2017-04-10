export enum DispatcherPriorities {
    ATOM = -2,
    ATOM_BUFFER = -1,
    OBSERVABLE = 1,
    ACTION = 2,
    OBSERVABLE_BUFFER = 3,
    EXTERNAL = 4,
    DIAGNOSE = 5,
    ALL = 10,
}
