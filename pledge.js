export const PledgeSymbol = Object.freeze({
  state: Symbol("PledgeState"),
  result: Symbol("PledgeResult"),
  isHandled: Symbol("PledgeIsHandled"),
  fulfillReactions: Symbol("PledgeFulfillReactions"),
  rejectReactions: Symbol("PledgeRejectReactions"),
})

export class Pledge {
  constructor(executor) {
    if (typeof executor === "undefined") {
      throw new TypeError("Executor missing.")
    }

    if (typeof executor !== "function") {
      throw new TypeError("Executor must be a function.")
    }

    // initialize properties
    this[PledgeSymbol.state] = "pending"
    this[PledgeSymbol.result] = undefined
    this[PledgeSymbol.isHandled] = false
    this[PledgeSymbol.fulfillReactions] = []
    this[PledgeSymbol.rejectReactions] = []

    const { resolve, reject } = createResolvingFunctions(this)

    /*
     * The executor is executed immediately. If it throws an error, then
     * that is a rejection. The error should not be allowed to bubble
     * out of this function.
     */
    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }
}

export function createResolvingFunctions(pledge) {
  // this "record" is used to track whether a Pledge is already resolved
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
    if (!isCallable(thenAction)) {
      return fulfillPledge(pledge, resolution)
    }

    /*
     * If `thenAction` is callable, then we need to wait for the thenable
     * to resolve before we can resolve this pledge.
     */

    // TODO: Let job be NewPromiseResolveThenableJob(promise, resolution, thenAction).
    // TODO: Perform HostEnqueuePromiseJob(job.[[Job]], job.[[Realm]]).
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

export function rejectPledge(pledge, reason) {
  if (pledge[PledgeSymbol.state] !== "pending") {
    throw new Error("Pledge is already settled.")
  }

  const reactions = pledge[PledgeSymbol.rejectReactions]

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
