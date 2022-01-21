const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("foo")
  }, 300)
})

myPromise.then(() => {
  console.log("done")
})
