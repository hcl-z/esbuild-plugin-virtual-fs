
interface CustomFetchConfig {
  retryTime: number
  retryInterval: number
}
export const customFetch = async (url: string | URL | globalThis.Request, init?: RequestInit, config: CustomFetchConfig = { retryTime: 0, retryInterval: 500 }) => {
  return new Promise<Response>(async (resolve, reject) => {
    let retryTime = 0
    let requestStatus = false
    while (!requestStatus && retryTime <= config.retryTime) {
      let response = await fetch(url, init)
      retryTime++
      if (response.ok) {
        requestStatus = true
        if(retryTime>config.retryTime){
          reject(response)
        }else{
          resolve(response)
        }
        break
      }else{
        await new Promise(resolve => setTimeout(resolve, config.retryInterval))
      }
    }
  })
}
