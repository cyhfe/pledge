export default class Pledge {
  constructor(executor) {
    this._fulfilmentTasks = []
    this._rejectionTasks = []
    this._prommiseResult = undefined
    this._promiseState = "pending"

    // const resolve = this.resolve.bind(this)
    // const reject = this.reject.bind(this)
    const { resolve, reject } = createResolvingFunctions(this)
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

  _clearAndEnqueueTasks(tasks) {
    this._fulfillmentTasks = undefined
    this._rejectionTasks = undefined
    tasks.map((task) => queueMicrotask(task))
  }
}

function createResolvingFunctions(pledge) {
  const resolve = (value) => {
    if (pledge._promiseState !== "pending") return pledge
    pledge._promiseState = "fulfilled"
    pledge._prommiseResult = value
    pledge._clearAndEnqueueTasks(pledge._fulfilmentTasks)
    return pledge
  }
  const reject = (err) => {
    if (pledge._promiseState !== "pending") return pledge
    pledge._promiseState = "rejected"
    pledge._promiseResult = err
    pledge._clearAndEnqueueTasks(pledge._rejectionTasks)
    return pledge
  }

  return {
    resolve,
    reject,
  }
}
