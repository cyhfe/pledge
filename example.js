import Pledge from "./pledge.js"

const promise = new Pledge((resolve, reject) => {
  console.log("imediataly")
  setTimeout(() => {
    console.log("cb")
    resolve(true)
  }, 1000)
})

promise.then((val) => {
  console.log(val)
})
