**Immview** is a library to create `Domain`s - *non-visual components* -
similar to flux stores, exposing their **state** or emitting **signals**
through `Observable`s pushing values and having specific to their concerns **actions**.
Their primary role is to encapsulate a concern
and to be the only thing exported from a javascript module or modules
that deal with the concern.

It completely replaces any flux implementation or Redux.

All `Domain`s must be provided with a single stream of values
(so either `Origin` or any other transformed `Observable`),
but not all `Observable`s must be attached to a `Domain` -
you can perform many transformations on a source
before it is exposed through a `Domain`.