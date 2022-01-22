# pledge

Promise 内部属性

- [[PromiseState]] pending | fulfilled | rejected.

- [[PromiseResult]] The value with which the promise has been fulfilled or rejected, if any. Only meaningful if [[PromiseState]] is not pending.

- [[PromiseFulfillReactions]] A List of PromiseReaction records to be processed when/if the promise transitions from the pending state to the fulfilled state.

- [[PromiseRejectReactions]] A List of PromiseReaction records to be processed when/if the promise transitions from the pending state to the rejected state.

- [[PromiseIsHandled]] A boolean indicating whether the promise has ever had a fulfillment or rejection handler; used in unhandled rejection tracking.

executor(resolve, reject)

resolve(value)

reject(reason)

then(onfulfilled, onRejected)
如果 promise 状态为 pending（默认）将成功或失败的回调推入\_fulfilmentTasks 或\_rejectionTasks 保存。
状态为 fulfilled （Promise.resolve）, 直接将 onFulfilled 进入微任务队列， rejected 同理

resolve(value)
将 promise 的状态修改为 fulfilled, result 为 value, 将\_fulfilmentTasks 任务全部进入微任务队列

```js
// then


  then(onFulfilled, onRejected) {
    const fulfilltask = () => {
      onFulfilled(this._prommiseResult)
    }

    const rejectionTask = () => {
      onRejected(this._prommiseResult)
    }

    switch (this._promiseState) {
      case "pending":
        this._fulfilmentTasks.push(fulfilltask)
        this._rejectionTasks.push(rejectionTask)
        break
      case "fulfilled":
        queueMicrotask(fulfilltask)
        break
      case "rejected":
        queueMicrotask(rejectionTask)
        break
      default:
        throw new Error()
    }
  }
```
