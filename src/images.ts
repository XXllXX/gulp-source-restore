import * as download from 'download'
import * as url from 'url'
import * as log from 'fancy-log'
export default async function (content) {
  if (content && /^data:image\/\w+;base64,/.test(content)) {
    return Buffer.from(
      content.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    )
  } else if (content && global.site) {
    const imgUrl = url.resolve(global.site, content)
    log(`Download ${imgUrl}`)
    return await download(imgUrl)
  }
}

const img = /[\"\']{1}[^\s]+[\/]{1,}[^\s]+.png[\"\']{1}/g
let cacheImgs = []
/**
 *
 */
export async function staticImage(content) {
  if (!global.site) {
    return
  }
  const imgs = content.match(img)
  let imageData = []
  if (imgs) {
    for (let index = 0; index < imgs.length; index++) {
      const element = imgs[index]
      const imgUrl = url.resolve(global.site, element.replace(/[\"\']{1}/g, ''))
      if (cacheImgs.indexOf(imgUrl) < 0) {
        try {
          imageData.push({
            url: imgUrl,
            path: element.replace(/[\"\']{1}/g, ''),
            data: await download(imgUrl),
          })
          log(`Download ${imgUrl} Down`)
          cacheImgs.push(imgUrl)
        } catch (error) {
          log.error(`Download ${imgUrl} error`)
        }
      }
    }
  }

  return imageData
}
