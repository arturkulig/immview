!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.immview=e():t.immview=e()}(this,function(){return function(t){function e(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return t[r].call(i.exports,i,i.exports,e),i.loaded=!0,i.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){"use strict";var r=n(1),i=n(2),s=n(3);e.Observable=s.Observable;var o=n(10);e.Origin=o.Origin;var u=n(9);e.Merge=u.Merge;var c=n(8);e.Domain=c.Domain;var a=n(7);e.action=a.action;var p=function(t){r.Dispatcher.push(t,i.DispatcherPriorities.EXTERNAL)};e.dispatch=p},function(t,e,n){"use strict";var r=n(6),i=n(2),s=new r.Dispatcher;e.Dispatcher=s;var o=function(t,e){void 0===e&&(e=i.DispatcherPriorities.EXTERNAL),s.push(t,e),s.run()};e.dispatch=o;var u=function(t,e){return void 0===e&&(e=i.DispatcherPriorities.EXTERNAL),new Promise(function(n,r){o(function(){try{n(t())}catch(t){console.error(t.stack||t.message||t),r(t)}},e)})};e.dispatchPromise=u},function(t,e){"use strict";var n;!function(t){t[t.OBSERVABLE=1]="OBSERVABLE",t[t.DOMAIN=2]="DOMAIN",t[t.BUFFER=3]="BUFFER",t[t.EXTERNAL=4]="EXTERNAL",t[t.TEST=10]="TEST"}(n=e.DispatcherPriorities||(e.DispatcherPriorities={}))},function(t,e,n){"use strict";var r=this&&this.__extends||function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},i=n(4),s=n(2),o=n(1),u="undefined"!=typeof Symbol?Symbol("ObservableSymbol"):"ObservableSymbol",c=function(t){function e(){return t.apply(this,arguments)||this}return r(e,t),e.of=function(){for(var t=[],n=0;arguments.length>n;n++)t[n]=arguments[n];return e.from(t)},e.from=function(t){if(t[u])return new e(function(e){t[u]().subscribe(e.next,e.error,e.complete)});if(t[Symbol.iterator])return new e(function(e){for(var n=e.next,r=e.error,i=e.complete,s=t[Symbol.iterator](),o=s.next();o.done===!1;o=s.next())o.value instanceof Error?r(o.value):n(o.value);i()});throw Error("Observable.from incorrect input")},e.prototype.map=function(t){var n=this;return new e(function(e){var r=n.subscribe(function(n){try{e.next(t(n))}catch(t){e.error(t)}},e.error,e.complete);return function(){return r.unsubscribe()}})},e.prototype.flatten=function(){var t=this;return new e(function(e){t.subscribe(function(t){t&&t.subscribe(function(t){e.next(t)},function(t){return e.error(t)})},e.error,e.complete)})},e.prototype.scan=function(t){var n=this;return new e(function(e){var r=null,i=n.subscribe(function(n){var i;try{i=r?t(n,r):n,r=i}catch(t){e.error(t)}e.next(i)},e.error,e.complete);return function(){return i.unsubscribe()}})},e.prototype.filter=function(t){var n=this;return new e(function(e){var r=n.subscribe(function(n){try{t(n)&&e.next(n)}catch(t){e.error(t)}},e.error,e.complete);return function(){return r.unsubscribe()}})},e.prototype.bufferCount=function(t,n){var r=this;void 0===n&&(n=null);var i=n||t,s=[];return new e(function(e){var n=r.subscribe(function(n){s.push(n),s.length===t&&(e.next(s.slice()),s=s.splice(i,t-i))},e.error,function(){s.length>t-i&&e.next(s.slice()),e.complete()});return function(){return n.unsubscribe()}})},e.prototype.buffer=function(t){var n=this;void 0===t&&(t=0);var r=[];return new e(function(e){var i=n.subscribe(function(n){r=t>0?[n].concat(r).splice(0,t):[n].concat(r),o.Dispatcher.push(function(){1>r.length||e.closed||e.next(r.splice(0,r.length).reverse())},s.DispatcherPriorities.BUFFER).run()},e.error,function(){r.length>0&&e.next(r.splice(0,r.length).reverse()),e.complete()});return function(){return i.unsubscribe()}})},e}(i.BaseObservable);e.Observable=c,c.prototype[u]=function(){return this}},function(t,e,n){"use strict";var r=n(1),i=n(2),s=n(5),o=function(){function t(t,e,n,r){this.next=t,this.error=e,this.complete=n,this._closed=r}return Object.defineProperty(t.prototype,"closed",{get:function(){return this._closed()},enumerable:!0,configurable:!0}),t}();e.SubscriptionObserver=o;var u;!function(t){t[t.Next=0]="Next",t[t.Error=1]="Error",t[t.Complete=2]="Complete"}(u=e.MessageTypes||(e.MessageTypes={}));var c=function(){},a=function(){function t(e){var n=this;this.closed=!1,this.nextSubscriptions=[],this.errorSubscriptions=[],this.completionSubscriptions=[],this.priority=t.lastObservablePriority++,this.cancelSubscriber=e&&e(new o(function(t){n.closed||n.pushMessage([u.Next,"function"==typeof t?t:function(){return t},c])},function(t){n.closed||n.pushMessage([u.Error,t,c])},function(){n.closed||n.pushMessage([u.Complete,,c])},function(){return n.closed}))||c}return t.prototype.last=function(){var e=this;if(this.lastValue)return this.lastValue;if(this.nextSubscriptions.length>0)return this.lastValue;var n=t.awaitingMessages.filter(function(t){var n=t[0];return n===e});if(0!==n.length){var r=n[0],i=r[1];return i[0]===u.Next?(t.awaitingMessages=t.awaitingMessages.filter(function(t){return t!==r}),this.lastValue=i[1](this.lastValue)):void 0}},t.prototype.subscribe=function(e,n,r){var i=this;if(this.closed)return new s.BaseObservableSubscription(null);var o=function(){u.unsubscribe(),i.completionSubscriptions=i.completionSubscriptions.filter(function(t){return t!==o})};this.completionSubscriptions.push(o),e&&this.nextSubscriptions.push(e),n&&this.errorSubscriptions.push(n),r&&this.completionSubscriptions.push(r);var u=new s.BaseObservableSubscription(function(){e&&(i.nextSubscriptions=i.nextSubscriptions.filter(function(t){return t!==e})),n&&(i.errorSubscriptions=i.errorSubscriptions.filter(function(t){return t!==n})),r&&(i.completionSubscriptions=i.completionSubscriptions.filter(function(t){return t!==r}))});return t.dispatchDigestMessages(),u},t.prototype.cancel=function(){this.pushMessage([u.Complete,,c])},t.prototype.pushMessage=function(e){t.awaitingMessages.push([this,e]),t.dispatchDigestMessages()},t.dispatchDigestMessages=function(){r.dispatch(t.digestAwaitingMessages,i.DispatcherPriorities.OBSERVABLE)},t.digestAwaitingMessages=function(){var e=t.popMessage(),n=e[0],r=e[1];n&&(t.digestNodeMessage(n,r),t.dispatchDigestMessages())},t.popMessage=function(){if(0===t.awaitingMessages.length)return[null,null];for(var e=0;t.awaitingMessages.length>e;e++){var n=t.awaitingMessages[e],r=n[0],i=void 0===r?null:r,s=n[1];if((s[0]!==u.Next||i.nextSubscriptions.length)&&(s[0]!==u.Error||i.errorSubscriptions.length)&&(s[0]!==u.Complete||i.completionSubscriptions.length))return t.awaitingMessages.splice(e,1),[i,s]}return[null,null]},t.digestNodeMessage=function(t,e){if(!t.closed){var n=e[0],r=e[2];if(n===u.Next){var i=e,s=i[1],o=s(t.lastValue);t.lastValue=o,t.nextSubscriptions.forEach(function(t){return t(o)})}else if(n===u.Error){var a=e,p=a[1];t.errorSubscriptions.forEach(function(t){return t(p)})}else n===u.Complete&&(t.cancelSubscriber(),t.cancelSubscriber=c,t.closed=!0,t.completionSubscriptions.forEach(function(t){return t()}));r()}},t}();a.awaitingMessages=[],a.lastObservablePriority=0,e.BaseObservable=a},function(t,e){"use strict";var n=function(){function t(t){this._unsubscribe=t}return Object.defineProperty(t.prototype,"closed",{get:function(){return!this._unsubscribe},enumerable:!0,configurable:!0}),t.prototype.unsubscribe=function(){var t=this._unsubscribe;this._unsubscribe=null,t&&t()},t}();e.BaseObservableSubscription=n},function(t,e){"use strict";var n=function(){function t(){this.nextTickScheduler=null,this._isRunning=!1,this.tasks=[]}return Object.defineProperty(t.prototype,"isRunning",{get:function(){return!!this._isRunning},enumerable:!0,configurable:!0}),t.prototype.push=function(t,e){return void 0===e&&(e=0),this.tasks.push({priority:e,job:t}),this},t.prototype.run=function(){var t=this;if(!this._isRunning){this._isRunning=!0;var e=this.findNextJob();return e?void(this.nextTickScheduler=this.nextTickScheduler||Promise.resolve()).then(function(){t.next(function(){try{e.job()}catch(t){console.error(t.stack||t.message||t)}},function(){t._isRunning=!1,t.run()})}):(this.nextTickScheduler=null,void(this._isRunning=!1))}},t.prototype.findNextJob=function(){for(var t=null,e=0;this.tasks.length>e;e++)(null===t||this.tasks[t].priority>this.tasks[e].priority)&&(t=e);return null===t?null:this.tasks.splice(t,1)[0]},t.prototype.next=function(t,e){t(),e()},t}();e.Dispatcher=n},function(t,e,n){"use strict";function r(t,e,n){var r=n.value;n.value=function(){for(var t=this,e=[],n=0;arguments.length>n;n++)e[n]=arguments[n];return s.dispatchPromise(function(){r.apply(t,e)},i.DispatcherPriorities.DOMAIN)}}var i=n(2),s=n(1);e.action=r},function(t,e,n){"use strict";var r=this&&this.__extends||function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},i=n(3),s=n(1),o=function(t){function e(e){return t.call(this,function(t){e.subscribe(t.next,t.error,t.complete)})||this}return r(e,t),e.create=function(t,n,r){var i=new e(t);if(n){var o=function(t){return Object.prototype.hasOwnProperty.call(n,t)?void(i[t]=function(){for(var e=[],r=0;arguments.length>r;r++)e[r]=arguments[r];return s.dispatchPromise((o=n[t]).bind.apply(o,[i].concat(e)));var o}):"continue"};for(var u in n)o(u)}if(r)for(var c in r)Object.prototype.hasOwnProperty.call(r,c)&&(i[c]=r[c]);return i},e}(i.Observable);e.Domain=o},function(t,e,n){"use strict";var r=this&&this.__extends||function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},i=this&&this.__assign||Object.assign||function(t){for(var e,n=1,r=arguments.length;r>n;n++){e=arguments[n];for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])}return t},s=n(3),o=function(t){function e(e){return t.call(this,function(t){var n=[],r=[],s=[],o={},u=[],c=function(c){return Object.prototype.hasOwnProperty.call(e,c)?(n.push(c),void u.push(e[c].subscribe(function(e){if(s&&s.push([c,e]),r.indexOf(c)<0&&r.push(c),n.length===r.length){if(s){for(var u={},a=[],p=[],f=0;s.length>f;f++)if(a.indexOf(s[f][0])<0){var l=s[f],h=l[0],b=l[1];u[h]=b,a.push(h)}else p.push(s[f]);return t.next(o=u),p.forEach(function(e){var n=e[0],r=e[1];t.next(o=i({},o,(s={},s[n]=r,s)));var s}),void(s=null)}t.next(o=i({},o,(v={},v[c]=e,v)));var v}}))):"continue"};for(var a in e)c(a);return function(){u.forEach(function(t){return t()})}})||this}return r(e,t),e}(s.Observable);e.Merge=o},function(t,e,n){"use strict";var r=this&&this.__extends||function(t,e){function n(){this.constructor=t}for(var r in e)e.hasOwnProperty(r)&&(t[r]=e[r]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},i=n(4),s=n(3),o=function(t){function e(e){var n=t.call(this,function(t){t.next(e)})||this;return n.lastValue=e,n}return r(e,t),e.prototype.push=function(t){var e=this;return new Promise(function(n){e.pushMessage([i.MessageTypes.Next,"function"==typeof t?t:function(){return t},n])})},e}(s.Observable);e.Origin=o}])});
//# sourceMappingURL=immview.js.map