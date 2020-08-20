## gulp-source-restore

> 使用 map 文件还原代码

---

### 使用

```javascript
import { src, dest } from 'gulp'
import restore from './src/index'
function defaultTask(done) {
  src(['./map/*.map']).pipe(restore('www')).pipe(dest('code'))
  done()
}
export default defaultTask
```
