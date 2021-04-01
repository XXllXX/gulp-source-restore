import { src, dest } from 'gulp'
import restore from './src/index'
function defaultTask(done) {
  src(['./map/xx.com/*.map'])
    .pipe(restore('http://xxx.com'))
    .pipe(dest('code1'))
  done()
}
export default defaultTask
