import { virtualFSPlugin } from 'esbuild-virtual-fs-plugin'
import * as esbuild from 'esbuild-wasm'
import { useEffect, useState } from 'react'
import CompileButton from './components/CompileButton'
import FileEditor from './components/FileEditor'
import FileList from './components/FileList'
import OutputDisplay from './components/OutputDisplay'

interface CompiledOutput {
  filename: string
  content: string
}

export default function EsbuildCompiler() {
  const [files, setFiles] = useState<{ [key: string]: {
    content: string
    isEntry: boolean
  } }>({})

  const [compiledOutputs, setCompiledOutputs] = useState<CompiledOutput[]>([])
  const [isCompiling, setIsCompiling] = useState(false)
  const [activeFile, setActiveFile] = useState('')
  const [isEsbuildReady, setIsEsbuildReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const initEsbuild = async () => {
      try {
        await esbuild.initialize({
          wasmURL: 'https://cdn.jsdelivr.net/npm/esbuild-wasm@0.24.0/esbuild.wasm',
        })
        setIsEsbuildReady(true)
      }
      catch (error) {
        console.error('Failed to initialize esbuild:', error)
      }
    }
    initEsbuild()
  }, [])

  const handleAddFile = (filename: string) => {
    setFiles((prevFiles) => {
      const isFirstFile = Object.keys(prevFiles).length === 0
      return {
        ...prevFiles,
        [filename]: {
          content: '',
          isEntry: isFirstFile,
        },
      }
    })
  }
  const handleFileChange = (filename: string, content: string) => {
    setFiles(prevFiles => ({
      ...prevFiles,
      [filename]: {
        content,
        isEntry: prevFiles[filename]?.isEntry,
      },
    }))
  }

  const handleDeleteFile = (filename: string) => {
    setFiles((prevFiles) => {
      const newFiles = { ...prevFiles }
      const wasEntry = newFiles[filename].isEntry
      delete newFiles[filename]

      if (wasEntry && Object.keys(newFiles).length > 0) {
        const nextEntryFile = Object.keys(newFiles)[0]
        newFiles[nextEntryFile] = {
          ...newFiles[nextEntryFile],
          isEntry: true,
        }
      }

      return newFiles
    })
  }

  const handleCompile = async () => {
    if (!isEsbuildReady) {
      console.error('esbuild is not ready yet')
      return
    }
    setIsCompiling(true)
    setHasError(false)
    try {
      const entryFile = Object.entries(files).find(([_, file]) => file.isEntry)?.[0]
      if (!entryFile) {
        throw new Error('No entry file found')
      }

      const result = await esbuild.build({
        entryPoints: [entryFile],
        bundle: true,
        write: false,
        outdir: 'dist',
        format: 'esm',
        splitting: true,
        metafile: true,
        plugins: [
          virtualFSPlugin({
            files,
            cdnUrl: 'https://cdn.jsdelivr.net/npm/',
          }),
        ],
      })

      const outputs = result.outputFiles.map(file => ({
        filename: file.path.split('/').pop() || 'output.js',
        content: file.text,
      }))

      if (result.metafile) {
        outputs.push({
          filename: 'meta.json',
          content: JSON.stringify(result.metafile, null, 2),
        })
      }

      setCompiledOutputs(outputs)
    }
    catch (error) {
      setHasError(true)
      setCompiledOutputs([{
        filename: 'error.txt',
        content: `${(error as Error).message}`,
      }])
    }
    setIsCompiling(false)
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-white text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center">Online esbuild Compiler</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
          <FileList
            files={files}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onSelectFile={setActiveFile}
            activeFile={activeFile || ''}
          />
          <FileEditor
            filename={activeFile || ''}
            content={activeFile ? files[activeFile].content : ''}
            onChange={content => handleFileChange(activeFile || '', content)}
          />
        </div>
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <CompileButton
            onClick={handleCompile}
            isCompiling={isCompiling}
            isDisabled={!isEsbuildReady}
            hasError={hasError}
          />
          <OutputDisplay
            outputs={compiledOutputs}
            hasError={hasError}
          />
        </div>
      </div>
    </div>
  )
}
