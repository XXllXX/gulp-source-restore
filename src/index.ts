import * as sourceMap from 'source-map'
import * as path from 'path'
import * as url from 'url'
import * as Vinyl from 'vinyl'
import * as PluginError from 'plugin-error'
import * as packageJson from '../package.json'
import * as through from 'through2'
import image, { staticImage } from './images'

export default function (site: string) {
  async function convert(code) {
    global['__webpack_public_path__'] = '/'
    global['site'] = site
    const fileName = url.parse(site).host
    console.log(path, site)

    let files = []
    try {
      const value = await new sourceMap.SourceMapConsumer(code)

      for (let index = 0; index < value.sources.length; index++) {
        const source = value.sources[index]
        let contents = value.sourceContentFor(source, false)
        const filePath = path.join(fileName, source.replace('webpack:///', ''))
        const extname = path.extname(filePath)
        if (
          ['.vue', '.js', '.cs', '.ts', '.jsx', '.json'].indexOf(extname) > -1
        ) {
          contents = contents.replace(/(\r\n|\n){2,}[//]{2,}[\s\S.]*/, '')

          let file = new Vinyl({
            base: process.cwd(),
            path: filePath,
            contents: Buffer.from(contents),
          })

          const imageData = await staticImage(contents)
          imageData.forEach((img) => {
            files.push(
              new Vinyl({
                base: process.cwd(),
                path: path.join(fileName, img.path),
                contents: img.data,
              })
            )
          })
          files.push(file)
        } else if (['.jpg', '.png'].indexOf(extname) > -1) {
          contents = contents.replace(/(\r\n|\n){2,}[//]{2,}[\s\S.]*/, '')
          let file = new Vinyl({
            base: process.cwd(),
            path: filePath,
            contents: await image(eval(contents)),
          })
          files.push(file)
        } else if (extname.indexOf('?') > -1) {
          // let index = extname.indexOf('?')
          // let temp = '_' + extname.substr(index + 1) + extname.substr(0, index)
          // if (filePath.indexOf('bottom') > -1) {
          //   console.log(filePath.replace(extname, temp))
          //   console.log(contents)
          // }
          // files.push(
          //   new Vinyl({
          //     base: process.cwd(),
          //     path: filePath.replace(extname, temp),
          //     contents: Buffer.from(contents),
          //   })
          // )
        }
      }
    } catch (error) {
      throw new PluginError(packageJson.name, error)
    }
    return files
  }

  // 创建一个让每个文件通过的 stream 通道
  var stream = through.obj(async function (file, encoding, down) {
    if (file.isBuffer()) {
      const before = file.contents.toString(encoding)
      let files = await convert(before)
      for (const item of files) {
        this.push(item)
      }
      return down()
    }
  })

  // 返回文件 stream
  return stream
}
