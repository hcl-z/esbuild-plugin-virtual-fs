import type { OnLoadResult, Plugin } from 'esbuild'
import * as path from 'node:path'

interface VirtualFile {
  contents: string
  loader?: 'js' | 'ts' | 'jsx' | 'tsx' | 'css' | 'json' | 'text'
}

interface VirtualFileSystemOptions {
  files: Record<string, VirtualFile>
}

export function virtualFSPlugin(options: VirtualFileSystemOptions): Plugin {
  const { files } = options
     const virtualFiles = new Map<string, VirtualFile>()

  // 规范化路径并添加到虚拟文件系统
  Object.entries(files).forEach(([filepath, content]) => {
    const normalizedPath = path.normalize(filepath)
    virtualFiles.set(normalizedPath, {
      contents: content.contents,
      loader: content.loader || 'js',
    })
  })

  return {
    name: 'virtual-file-system',
    setup(build) {
      // 处理虚拟文件的解析
      build.onResolve({ filter: /.*/ }, (args) => {
        const normalizedPath = path.normalize(args.path)
        if (virtualFiles.has(normalizedPath)) {
          return {
            path: normalizedPath,
            namespace: 'virtual-fs',
          }
        }
        return null
      })

      // 加载虚拟文件内容
      build.onLoad({ filter: /.*/, namespace: 'virtual-fs' }, (args) => {
        const file = virtualFiles.get(args.path)
        if (!file) {
          return null
        }

        const result: OnLoadResult = {
          contents: file.contents,
          loader: file.loader,
        }
        return result
      })

      build.onLoad({ filter: /.*/, namespace: 'cdn-import' }, async (args) => {
        const response = await fetch(args.path)
        if (!response.ok) {
          throw new Error(`Failed to fetch ${args.path}: ${response.statusText}`)
        }
        const contents = await response.text()
        return {
          contents,
          loader: 'js',
        }
      })
    },
  }
}
