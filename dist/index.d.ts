import { Observable } from './Observable';
import { Origin } from './Origin';
import { Merge } from './Merge';
import { Domain } from './Domain';
import { action } from './Domain.action';
declare const dispatchExt: (job: () => any) => void;
export { Observable, Origin, Merge, Domain, dispatchExt as dispatch, action };
