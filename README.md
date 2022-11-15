# obsidian-image-manager
a plugin to make obsidian image management more efficient.
# 目标
实现一个扩展 obsidian 原生图片功能的附加功能插件。关键在于好用。
# 怎么样算好用？
一个好用的图片管理无非要解决日常使用痛点。  
痛点包含：  
1. 移动文件的时候，无法将文件中对图片引用的相对路径进行更新；  
2. 删除文件的时候，图片仍然存在；  
3. 没有相对目录结构的图片存储功能（比如原本的笔记目录为 /xxx/b/note.txt，图片不支持存在类似的 /image/b/note.png 之类的功能）；  
4. 图片文件单独存储，而不能随着文件直接走，比如将文件拷到 u 盘或者传输到别的地方还要带着图片一起走；  
5. 几种存储方式之间的转换，比如内部编码方式转相对存储方式，相对单目录存储方式转相对多级目录映射存储方式；  
6. 在使用插件之前就已经乱了的情况下，没法使用插件的正常功能。

解决这些痛点就能够搞定一个图片管理插件了。

# 实现功能
- 图片存储方式转换（5）：
  - 目录形式的图片转换第一步都是先收集到指定目录，然后再组织成各个形式；
  - 编码形式的图片转换，如果转编码直接转，如果从编码到文件也是先到指定目录再组织；
- （子）图片收集：扫描所有笔记，将所有图片聚合到某个目录下，同时修改文件中对图片的引用路径；
- （子）相对目录存储功能（3）；
- （子）图片以编码形式写入文件（4）；  
<br>

- 图片按名收集：扫描所有笔记，将所有图片聚合到某个目录下，同时修改文件中对图片的引用路径，区别在于这个收集仅按名字搜索（忽略路径，只搜索名字），如果出现重名则该图片不处理并提醒（6）；  
<br>

- 移动文件时附带移动图片或者更新引用（1）  
- 删除文件时附带删除图片（2）  

# 附加功能
- ~~图片一键转换，将所有图片引用格式一键转换为相对引用 or 绝对引用；(作废，发现 markdown 语法本身不支持绝对路径)~~
- 如果图片以编码形式放在文件中，允许浏览文件时只浏览到编码的上面（也就自动隐藏图片编码的部分，这种情况下编码基本都聚合在文件末尾）；  
- url 图片存到本地；  
 






# 开发日志

第一次写 TypeScript 项目，直接用这个插件上手hhh。

## 2022/11/13 12:00 准备用 markdown-it 去解析 markdown 内容，解析成多个语法块，再借助正则、分行的原文本和语法块信息恢复处理后的原文本

1. 看了 markdown-it 源码，分析用 markdown-it 解析和写回 md 的可行性。解析没啥问题挺好用，但是写回有点麻烦；
2. 决定用正则做辅助写回，因为单纯用 markdown-it 去拼接恢复文本挺麻烦的（要看各种情况下的 image 文本如何拼回，要进一步细看 markdown-it 源码，搞起来比较头秃，而且收益不高），暂时先用 re 去简单匹配格式（毕竟图片格式就那么几个），然后做字符串切分再尝试拼回原 markdown 文本；
3. 碰到个正则表达式转义问题，因为我是用 RegExp 构造正则表达式，原字符串中的一些特殊符号因为在正则里面是有含义的，所以直接给进去得到的表达式是错的，写一个 regExpEscape 解决；
4. 发现 markdown-it 的 token 有行号，依据这个来恢复一些空行信息；
5. 发现 markdown-it 的 token 居然会把代码块的 ``` 抽到外面去，导致 content 里面只有代码内容...

markdown-it 库的一些逻辑规则：

1. parse_block 时候会区分 inline 和 fence；
2. 只有 inline 会有 image；
3. markdown-it 用 \n 判断换行，这是 token.map 的行号的依据。


## 2022/11/13 20:24 打算转型，用正则匹配处理替换，加上 markdown-it 做词法校验做

使用原生的 markdown-it 库去解析，然后根据 token 反向生成 markdown 这个过程太恶心了。一个 markdown-it 这个库本身的 token 就很乱，每个 markdown 语法对应的 token 内容都不一样，而且 content 也不是在一块的。

比如列表的符号 - 和本身的 content 是分开的，要恢复这个语法的内容就得分别抽出来处理，而其它的规则可能又和列表的不一样，等同于要写很多不同的逻辑去恢复不同的规则，很蛋疼。

除此之外还有换行的问题，蛋疼的 markdown-it 只关心到 html 的方向，处理过程中把换行内容全干掉了...

为什么要用 markdown-it 去校验，因为考虑到有些情况可能会把图片文本放到代码块中（虽然概率很低），诸如此类的情况，我们可以通过库去帮我们考虑这种情况，从而知道哪里就是图片，哪里不是，正则就很难或者很难最大化收益地做到这种事情（也是很难考虑全所有情况，虽然接库也很蛋疼）。

现在考虑到对 markdown-it 再重度依赖已经很难进行下去了，下一波准备试验一下主要用正则的方法去做。用正则匹配的图片文本如果是在 markdown-it 认为的 inline 文本块内，那这部分文本必然会被 markdown-it 认为是图片，基于这个前提就没什么大问题了（事实上，按照现在的逻辑来看，在 inline 里能走到 image 的文本，必然是符合 image 格式的图片）。

步骤：
1. markdown-it 解析源文本；
2. 仍然通过 inline 去判断 token 分析的必要性；
3. 如果 inline 里面包含 image，那么就将原文本对应 inline token 的文本行范围的那部分文本抽取出来，然后用正则去搜索图片，分割成多个 block（文本块，以字符为单位，包含图片块和普通文本块）；
4. 之后对这些块进行处理；
5. 用这些块做文本拼接，恢复原 markdown 内容。
