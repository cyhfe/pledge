export default class Pledge {
  constructor(executor) {
    this._fulfilmentTasks = []
    this._rejectionTasks = []
    this._prommiseResult = undefined
    this._promiseState = "pending"

    const resolve = this.resolve.bind(this)
    const reject = this.reject.bind(this)

    executor(resolve, reject)
  }
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
  resolve(value) {
    if (this._promiseState !== "pending") return this
    this._promiseState = "fulfilled"
    this._prommiseResult = value
    this._clearAndEnqueueTasks(this._fulfilmentTasks)
    return this
  }
  reject(err) {
    if (this._promiseState !== "pending") return this
    this._promiseState = "rejected"
    this._promiseResult = err
    this._clearAndEnqueueTasks(this._rejectionTasks)
    return this
  }
  _clearAndEnqueueTasks(tasks) {
    this._fulfillmentTasks = undefined
    this._rejectionTasks = undefined
    tasks.map((task) => queueMicrotask(task))
  }
}
