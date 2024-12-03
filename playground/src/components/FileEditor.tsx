import Editor from '@monaco-editor/react'

interface FileEditorProps {
  filename: string
  content: string
  onChange: (content: string) => void
}

export default function FileEditor({ filename, content, onChange }: FileEditorProps) {
  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    switch (ext) {
      case 'html':
        return 'html'
      case 'css':
        return 'css'
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'json':
        return 'json'
      case 'jsx':
        return 'javascript'
      case 'js':
      default:
        return 'javascript'
    }
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        language={getLanguage(filename)}
        value={content}
        onChange={value => onChange(value || '')}
        theme="light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  )
}
