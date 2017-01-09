import { Observable } from './Observable';
import { Data } from './Data';
import { Merge } from './Merge';
import { Domain } from './Domain';
import { action } from './Domain.action';
declare const dispatchExt: (job: () => any) => void;
export { Observable, Data, Merge, Domain, dispatchExt as dispatch, action };
