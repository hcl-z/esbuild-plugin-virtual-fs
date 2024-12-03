import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'

interface CompileButtonProps {
  onClick: () => void
  isCompiling: boolean
  isDisabled: boolean
  hasError: boolean
}

export default function CompileButton({ 
  onClick, 
  isCompiling, 
  isDisabled,
  hasError
}: CompileButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isCompiling || isDisabled}
      variant={hasError ? "destructive" : "default"}
      className="w-full"
    >
      {isCompiling ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          编译中...
        </>
      ) : hasError ? (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          编译失败
        </>
      ) : (
        '编译'
      )}
    </Button>
  )
}
