/**
 * 下载图片并重命名
 * download('https://www.baidu.com/img/baidu_resultlogo@2.png', 'ab.png')
 */

/**
 * 获取 blob
 * @param  {String} url 目标文件地址
 * @return {cb}
 */
const getBlob = (url: string, cb: (arg: any) => void, backupUrl: string) => {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'blob'
  xhr.onload = function () {
    console.log(xhr)
    if (xhr.status === 200) {
      cb(xhr.response)
    }
  }
  xhr.send()
  if (xhr.status !== 200) {
    const backupXhr = new XMLHttpRequest()
    backupXhr.open('GET', backupUrl, true)
    backupXhr.responseType = 'blob'
    backupXhr.onload = function () {
      if (backupXhr.status === 200) {
        cb(backupXhr.response)
      } else {
        throw new Error('Download failed, please try again later')
      }
    }
    backupXhr.send()
  } else {
    cb(xhr.response)
  }
}

/**
 * 保存
 * @param  {Blob} blob
 * @param  {String} filename 想要保存的文件名称
 */
const saveAs = (blob: Blob, filename: string) => {
  const link = document.createElement('a')
  const body = document.querySelector('body')

  link.href = window.URL.createObjectURL(blob)
  link.download = filename
  if (!body) return

  // fix Firefox
  link.style.display = 'none'
  body.appendChild(link)

  link.click()
  body.removeChild(link)

  window.URL.revokeObjectURL(link.href)
}

/**
 * 下载
 * @param  {String} url 目标文件地址
 * @param  {String} filename 想要保存的文件名称
 */
const downloadRemoteImg = (
  url: string,
  filename: string,
  backupUrl: string,
) => {
  getBlob(
    url,
    function (blob: Blob) {
      saveAs(blob, filename)
    },
    backupUrl,
  )
}
export default downloadRemoteImg
