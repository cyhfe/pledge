export const PledgeSymbol = Object.freeze({
  state: Symbol("PledgeState"),
  result: Symbol("PledgeResult"),
  isHandled: Symbol("PledgeIsHandled"),
  fulfillReactions: Symbol("PledgeFulfillReactions"),
  rejectReactions: Symbol("PledgeRejectReactions"),
})

class Pledge {
  constructor(executor) {
    if (executor === "undefinded") {
      throw new Error("missing executor")
    }

    if (typeof executor !== "function") {
      throw new Error("executor must be a function")
    }

    // 初始化属性
    this[PledgeSymbol.state] = "pending"
    this[PledgeSymbol.isHandled] = false
    this[PledgeSymbol.result] = undefined
    this[PledgeSymbol.fulfillReactions] = []
    this[PledgeSymbol.rejectReactions] = []

    const { resolve, reject } = createResolvingFunctions(this)

    // 构造函数立即执行，如果抛出错误会被reject处理

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }
}

function createResolvingFunctions(Pledge) {
  // pledge只能被resolve或reject一次
  const alreadyResolved = { value: false }

  const resolve = (resolution) => {
    if (alreadyResolved.value) {
      return
    }

    alreadyResolved.value = true

    // can't resolve to the same pledge
    if (Object.is(resolution, pledge)) {
      const selfResolutionError = new TypeError("Cannot resolve to self.")
      return rejectPledge(pledge, selfResolutionError)
    }

    // non-objects fulfill immediately
    if (!isObject(resolution)) {
      return fulfillPledge(pledge, resolution)
    }

    let thenAction

    /*
     * At this point, we know `resolution` is an object. If the object
     * is a thenable, then we need to wait until the thenable is resolved
     * before resolving the original pledge.
     *
     * The `try-catch` is because retrieving the `then` property may cause
     * an error if it has a getter and any errors must be caught and used
     * to reject the pledge.
     */
    try {
      thenAction = resolution.then
    } catch (thenError) {
      return rejectPledge(pledge, thenError)
    }

    // if the thenAction isn't callable then fulfill the pledge
    if (typeof thenAction !== "function") {
      return fulfillPledge(pledge, resolution)
    }

    /*
     * If `thenAction` is callable, then we need to wait for the thenable
     * to resolve before we can resolve this pledge.
     */
    const job = new PledgeResolveThenableJob(pledge, resolution, thenAction)
    queueMicrotask(job)
  }

  // attach the record of resolution and the original pledge
  resolve.alreadyResolved = alreadyResolved
  resolve.pledge = pledge

  const reject = (reason) => {
    if (alreadyResolved.value) {
      return
    }

    alreadyResolved.value = true

    return rejectPledge(pledge, reason)
  }

  // attach the record of resolution and the original pledge
  reject.alreadyResolved = alreadyResolved
  reject.pledge = pledge

  return {
    resolve,
    reject,
  }
}

function rejectPledge(pledge, reason) {
  if (pledge[PledgeSymbol.state] !== "pending") {
    throw new Error("Pledge is already settled.")
  }

  const reactions = pledge[PledgeSymbol.rejectReactions]

  // 修改属性
  pledge[PledgeSymbol.result] = reason
  pledge[PledgeSymbol.fulfillReactions] = undefined
  pledge[PledgeSymbol.rejectReactions] = undefined
  pledge[PledgeSymbol.state] = "rejected"

  if (!pledge[PledgeSymbol.isHandled]) {
    // TODO: perform HostPromiseRejectionTracker(promise, "reject").
  }

  // TODO: Return `TriggerPromiseReactions(reactions, reason)`.
}

export function fulfillPledge(pledge, value) {
  if (pledge[PledgeSymbol.state] !== "pending") {
    throw new Error("Pledge is already settled.")
  }

  const reactions = pledge[PledgeSymbol.fulfillReactions]

  pledge[PledgeSymbol.result] = value
  pledge[PledgeSymbol.fulfillReactions] = undefined
  pledge[PledgeSymbol.rejectReactions] = undefined
  pledge[PledgeSymbol.state] = "fulfilled"

  // TODO: Return `TriggerPromiseReactions(reactions, reason)`.
}

export class PledgeResolveThenableJob {
  constructor(pledgeToResolve, thenable, then) {
    return () => {
      const { resolve, reject } = createResolvingFunctions(pledgeToResolve)

      try {
        // same as thenable.then(resolve, reject)
        then.apply(thenable, [resolve, reject])
      } catch (thenError) {
        // same as reject(thenError)
        reject.apply(undefined, [thenError])
      }
    }
  }
}
