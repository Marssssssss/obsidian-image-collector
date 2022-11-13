### 前置工作

需要导入两个库：

```javascript
from distutils.core import setup
import py2exe  # 必须，这个库会做一些注入工作
```

写入 sys.path 协助 import 收集，个人经验如果不指定，有些不在 sys.path 目录下的依赖库会无法导入：

```javascript
sys.path += ["xxx/xxx"]  # 指定的库的位置
```



### 标准 setup 编写指南

```javascript
setup(
   version="1.0.0",  # 版本号
   name="xxx",  # 名字
   options=options,  # 额外选项，py2exe 的选项放在这
   data_files=data_files,  # 额外需要写入的其它文件
   zipfile="xxx.zip",  # 指定的库打包压缩文件的名字
   console=[
      {
         "script": <xxxpath>,  # 打包的 py 文件的路径
         "dest_base": "xxx",  # 打包产出的可执行文件的名字
      }
   ]
)
```



### data_files 编写指南：

```javascript
# 这个选项用于在打包的时候把一些其它文件顺带转移到某个目录下
data_files = [
   # 用一个 tuple 表示一项
   (
       # 文件的目标位置，以发布的目录为根目录的相对路径
       ".",
       # 该项要移动的文件目录，以发布的目录为根目录的相对路径
       [
           "../dlls/glfw3.dll", 
           "../dlls/MSVCP140.dll", 
           "../dlls/msvcr100.dll", 
           "../dlls/VCRUNTIME140.dll"
       ]
   )
]
```



### 额外选项编写指南

```javascript
options = {
   "py2exe": {
      "compressed": 1,  # 是否压缩，如果是会自带压缩包，否则全部打包到可执行文件里
      "includes": includes,  # 手动指定的导入模块，一些特殊的导入方式无法检测到的，通过这个选项导入
      "excludes": excludes,  # 手动排除的导入模块，有些模块可能不需要打包进来（动态变化），通过这个选项剔除
      "dll_excludes": dll_excludes,  # 剔除一些会附带的 dll，但实际上又用不到
      "dist_dir": "../dist",  # 打包/发布的目标目录
   }
}
```



### 其它坑

- 打包出来的可执行文件，默认工作目录为发布的目录；
- 需要注意 multiprocessing 模块在 windows 下打包版本的执行坑（无限创建子进程，需要用 freeze_support 进行预先处理）。


### 玩点骚的



![这是图片](https://markdown.com.cn/assets/img/philly-magic-garden.9c0b4415.jpg)