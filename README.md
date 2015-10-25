# pathanalyze
命令行方式的目录文件分析。

我们主要用于游戏开发阶段资源分析，为打包压缩做前期准备，当然也可以用于别的场景，分析目录下文件容量分布情况，还可以按扩展名方式分析。

```
npm install pathanalyze -g
pathanalyze **/win32/*.*
```

分析结果保存在当前目录的output.json文件里，这个文件可以通过项目来图形化分析。