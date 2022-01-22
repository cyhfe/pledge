import Pledge from "./pledge.js"

const promise = new Pledge((resolve, reject) => {
  console.log("Executor")
  resolve(42)
})
promise.then((result) => {
  console.log(result)
})

console.log("hi")
