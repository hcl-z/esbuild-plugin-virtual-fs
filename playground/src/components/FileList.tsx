import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileCode, FileIcon, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface FileListProps {
  files: { [key: string]: {
    content: string
    isEntry: boolean
  } }
  onAddFile: (filename: string) => void
  onSelectFile: (filename: string) => void
  onDeleteFile: (filename: string) => void
  activeFile: string
}

export default function FileList({ 
  files, 
  onAddFile, 
  onSelectFile, 
  onDeleteFile,
  activeFile,
}: FileListProps) {
  const [isAddingFile, setIsAddingFile] = useState(false)
  const [newFilename, setNewFilename] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAddingFile && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingFile])

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.html'))
      return <FileIcon className="w-4 h-4 mr-2 text-orange-600" />
    if (filename.endsWith('.css'))
      return <FileCode className="w-4 h-4 mr-2 text-blue-600" />
    if (filename.endsWith('.tsx') || filename.endsWith('.ts'))
      return <FileCode className="w-4 h-4 mr-2 text-blue-700" />
    return <FileCode className="w-4 h-4 mr-2 text-green-600" />
  }

  const handleAddFile = () => {
    if (newFilename && !files[newFilename]) {
      onAddFile(newFilename)
      onSelectFile(newFilename)
      setNewFilename('')
      setIsAddingFile(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddFile()
    }
  }

  const handleDeleteFile = (
    e: React.MouseEvent,
    filename: string,
  ) => {
    e.stopPropagation()
    if (filename === activeFile) {
      const fileNames = Object.keys(files)
      const currentIndex = fileNames.indexOf(filename)
      const nextFile = fileNames[currentIndex + 1] || fileNames[currentIndex - 1]
      if (nextFile) {
        onSelectFile(nextFile)
      }
    }
    onDeleteFile(filename)
  }

  return (
    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-t-lg overflow-x-auto">
      {Object.entries(files).map(([filename, file]) => (
        <button
          key={filename}
          onClick={() => onSelectFile(filename)}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm group ${
            filename === activeFile
              ? 'bg-white text-gray-800 shadow'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center flex-1">
            {getFileIcon(filename)}
            <span className={`${file.isEntry ? 'text-green-600 font-medium' : ''}`}>
              {filename}
            </span>
          </div>
          <div className="flex items-center opacity-0 group-hover:opacity-100 ml-2">
            <button
              onClick={(e) => handleDeleteFile(e, filename)}
              className="p-1 rounded-full hover:bg-gray-200"
              disabled={Object.keys(files).length === 1}
              title={Object.keys(files).length === 1 ? "至少保留一个文件" : "删除文件"}
            >
              <X className={`w-3 h-3 ${
                Object.keys(files).length === 1 
                  ? 'text-gray-400' 
                  : 'text-gray-500 hover:text-gray-700'
              }`} />
            </button>
          </div>
        </button>
      ))}

      {isAddingFile ? (
        <div className="flex items-center">
          <Input
            ref={inputRef}
            type="text"
            value={newFilename}
            onChange={e => setNewFilename(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New filename"
            className="w-32 h-8 text-sm"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddFile}
            className="ml-1 text-gray-600 hover:text-gray-800"
            disabled={!newFilename}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddingFile(true)}
          className="text-gray-600 hover:text-gray-800"
        >
          <Plus className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
