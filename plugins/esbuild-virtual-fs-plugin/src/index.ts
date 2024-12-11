import type { ImportKind, Plugin } from 'esbuild'
import { customFetch } from './utils'

const extMap = {
  'module.css': {
    loader: 'css',
    isModule: true,
  },
  ts: {
    loader: 'tsx',
  },
  tsx: {
    loader: 'tsx',
  },
  jsx: {
    loader: 'jsx',
  },
  css: {
    loader: 'css',
  },
  json: {
    loader: 'json'
  },
  txt: {
    loader: 'text',
  },
}

interface VirtualFile {
  content: string
  loader?: keyof typeof extMap
  isEntry?: boolean
}

/**
 * 虚拟文件系统插件选项
 * @param files - 文件映射
 * @param cdnUrl- CDN 地址
 */
interface VirtualFileSystemPluginOptions {
  files: Record<string, VirtualFile>
  cdnUrl?: string
  retryTime?: number
  retryInterval?: number
  enableSass?: boolean
  enableLess?: boolean
}
// 判断是否为网络链接
function isValidUrl(url: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return true
  }
  catch {
    return false
  }
}

function getLoader(path: string) {
  for(const item of Object.keys(extMap)){
    if(path.endsWith(`.${item}`)){
      return extMap[item as keyof typeof extMap]
    }
  }
  return 'js'
}

function formatFilePath(path: string) {
  // 移除开头的 ./ 或 /
  path = path.replace(/^(\.\/|\/)+/, '')

  // 转换为 file:// 格式
  return `file://${path}`
}

export function virtualFSPlugin(options: VirtualFileSystemPluginOptions): Plugin {
  const { files } = options
  const virtualFiles = new Map<string, VirtualFile>()
  // 规范化路径并添加到虚拟文件系统
  Object.entries(files).forEach(([filepath, content]) => {
    virtualFiles.set(formatFilePath(filepath), {
      content: content.content,
    })
  })

  return {
    name: 'virtual-file-system',
    async setup(build) {

      // 处理所有文件路径
      build.onResolve({ filter: /.*/ }, async (args) => {
        console.log('Resolving:', args)
        // 这里我们可以直接使用 args 中的信息
        const { path, importer, namespace, resolveDir, kind } = args

      
        if (isValidUrl(path)) {
          return {
            path,
            namespace: 'cdn-import',
          }
        }

        if (kind === 'entry-point') {
          return {
            path: formatFilePath(path),
            namespace: 'virtual-fs',
            // pluginName:'less-plugin',
            pluginData:{
              loader:getLoader(path)
            }
          }
        }

        if (importer.startsWith('http')) {
          return {
            path: `https://esm.sh/${path.replace(/^(\.\/|\/)+/, '')}`,
            namespace: 'cdn-import'
          }
        }else if (path.startsWith('./') || path.startsWith('../')) {
          return {
            path: formatFilePath(path),
            namespace: 'virtual-fs',
            pluginData:{
             loader:getLoader(path)
            }
          }
        }
        else {
          return {
            path: `https://esm.sh/${path}`,
            namespace: 'cdn-import',
          }
        }
      })

      // 加载文件内容
      build.onLoad({ filter: /.*/, namespace: 'virtual-fs' }, async(args) => {
        console.log('local', args)
        const filename = args.path
        const loader = args.pluginData?.loader
        console.log('filename', filename, virtualFiles)
        if (virtualFiles.has(filename)) {
            console.log('local');
            return {
              // contents: virtualFiles.get(filename)!.content,
              // loader,
              pluginName:'less-plugin',
            }
        }
        return { errors: [{ text: `File not found: ${filename}` }] }
      })

      // 从网络加载模块
      build.onLoad({ filter: /.*/, namespace: 'cdn-import' }, async (args) => {
        console.log('get from cdn', args)
        const response = await customFetch(args.path)
        if (!response.ok) {
          throw new Error(`Failed to fetch ${args.path}: ${response.statusText}`)
        }
        const contents = await response.text()

        return {
          contents,
          loader: 'js',
        }
      })

      build.onEnd(async (result) => {
        console.log('build end', result)
      })
    },
  }
}
