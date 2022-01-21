# pledge

Promise 内部属性

- [[PromiseState]] One of pending, fulfilled, or rejected. Governs how a promise will react to incoming calls to its then method.

- [[PromiseResult]] The value with which the promise has been fulfilled or rejected, if any. Only meaningful if [[PromiseState]] is not pending.

- [[PromiseFulfillReactions]] A List of PromiseReaction records to be processed when/if the promise transitions from the pending state to the fulfilled state.

- [[PromiseRejectReactions]] A List of PromiseReaction records to be processed when/if the promise transitions from the pending state to the rejected state.

- [[PromiseIsHandled]] A boolean indicating whether the promise has ever had a fulfillment or rejection handler; used in unhandled rejection tracking.
