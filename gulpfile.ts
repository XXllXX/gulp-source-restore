import { src, dest } from 'gulp'
import restore from './src/index'
function defaultTask(done) {
  src(['./map/*.map']).pipe(restore('www')).pipe(dest('code'))
  done()
}
export default defaultTask
