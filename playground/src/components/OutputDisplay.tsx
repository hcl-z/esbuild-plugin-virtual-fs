import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, Check, Copy, Eye } from 'lucide-react'
import { useState } from 'react'

interface OutputDisplayProps {
  outputs: Array<{
    filename: string
    content: string
  }>
  hasError: boolean
}

export default function OutputDisplay({ outputs, hasError }: OutputDisplayProps) {
  const [expandedFile, setExpandedFile] = useState<string | null>(null)
  const [copiedFile, setCopiedFile] = useState<string | null>(null)

  const handleCopy = async (content: string, filename: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedFile(filename)
    setTimeout(() => setCopiedFile(null), 2000)
  }

  if (hasError) {
    return (
      <div className="mt-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700 mb-2">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">编译错误</h3>
          </div>
          <pre className="text-sm text-red-600 whitespace-pre-wrap">
            {outputs[0]?.content || '未知错误'}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">编译输出</h3>
      <ScrollArea className="h-[calc(100vh-240px)]">
        <div className="space-y-2">
          {outputs.map(({ filename, content }) => (
            <div 
              key={filename}
              className="bg-white rounded-lg border p-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{filename}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(content, filename)}
                    className="h-8 px-2"
                  >
                    {copiedFile === filename ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedFile(
                      expandedFile === filename ? null : filename
                    )}
                    className="h-8 px-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {expandedFile === filename && (
                <pre className="mt-2 p-2 bg-gray-50 rounded text-sm overflow-x-auto">
                  {content}
                </pre>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
