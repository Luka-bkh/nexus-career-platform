"use client";

import React, { useState, useRef, useEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'python' | 'javascript' | 'sql';
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
}

export function CodeEditor({ 
  value, 
  onChange, 
  language = 'python', 
  placeholder = '코드를 입력하세요...', 
  readOnly = false,
  height = '300px'
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);

  useEffect(() => {
    updateLineNumbers();
  }, [value]);

  const updateLineNumbers = () => {
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);
      
      // 커서 위치 조정
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const getLanguageIcon = () => {
    switch (language) {
      case 'python':
        return '🐍';
      case 'javascript':
        return '⚡';
      case 'sql':
        return '🗃️';
      default:
        return '💻';
    }
  };

  const getLanguageColor = () => {
    switch (language) {
      case 'python':
        return 'bg-blue-100 text-blue-800';
      case 'javascript':
        return 'bg-yellow-100 text-yellow-800';
      case 'sql':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor()}`}>
            {getLanguageIcon()} {language.toUpperCase()}
          </span>
          {readOnly && (
            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
              읽기 전용
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onChange('')}
            className="text-gray-500 hover:text-gray-700 text-sm"
            disabled={readOnly}
          >
            🗑️ 지우기
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
            }}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            📋 복사
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex">
          {/* 라인 번호 */}
          <div className="w-12 bg-gray-50 border-r border-gray-200 p-2 text-right text-sm text-gray-500 font-mono overflow-hidden">
            {lineNumbers.map((num) => (
              <div key={num} className="h-6 leading-6">
                {num}
              </div>
            ))}
          </div>

          {/* 코드 입력 영역 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              readOnly={readOnly}
              className="w-full h-full p-2 font-mono text-sm leading-6 resize-none border-none outline-none bg-transparent"
              style={{
                tabSize: 4,
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflowX: 'auto',
              }}
              spellCheck={false}
            />
            
            {/* 구문 하이라이팅 힌트 (간단한 구현) */}
            {value && (
              <div className="absolute inset-2 pointer-events-none font-mono text-sm leading-6 text-transparent">
                <pre className="whitespace-pre overflow-hidden">
                  {highlightSyntax(value, language)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
        <span>
          줄: {value.split('\n').length} | 글자: {value.length}
        </span>
        <span className="flex items-center space-x-2">
          <span>Tab: 들여쓰기</span>
          <span>•</span>
          <span>Ctrl+A: 전체 선택</span>
        </span>
      </div>
    </div>
  );
}

// 간단한 구문 하이라이팅 함수
function highlightSyntax(code: string, language: string): React.ReactNode {
  if (language === 'python') {
    return code
      .replace(/(def|class|if|else|elif|for|while|import|from|return|print|len|range)\b/g, 
        '<span style="color: #8B5CF6;">$1</span>')
      .replace(/(=|==|!=|<=|>=|<|>|\+|\-|\*|\/)/g, 
        '<span style="color: #10B981;">$1</span>')
      .replace(/(['"])(.*?)\1/g, 
        '<span style="color: #F59E0B;">$1$2$1</span>')
      .replace(/(#.*$)/gm, 
        '<span style="color: #6B7280;">$1</span>');
  }
  
  if (language === 'javascript') {
    return code
      .replace(/(function|var|let|const|if|else|for|while|return|console)\b/g, 
        '<span style="color: #8B5CF6;">$1</span>')
      .replace(/(=|==|===|!=|!==|<=|>=|<|>|\+|\-|\*|\/)/g, 
        '<span style="color: #10B981;">$1</span>')
      .replace(/(['"])(.*?)\1/g, 
        '<span style="color: #F59E0B;">$1$2$1</span>')
      .replace(/(\/\/.*$)/gm, 
        '<span style="color: #6B7280;">$1</span>');
  }
  
  if (language === 'sql') {
    return code
      .replace(/(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|INNER|LEFT|RIGHT|GROUP BY|ORDER BY|LIMIT)\b/gi, 
        '<span style="color: #8B5CF6;">$1</span>')
      .replace(/(=|!=|<=|>=|<|>|AND|OR|NOT|IN|LIKE)\b/gi, 
        '<span style="color: #10B981;">$1</span>')
      .replace(/(['"])(.*?)\1/g, 
        '<span style="color: #F59E0B;">$1$2$1</span>')
      .replace(/(--.*$)/gm, 
        '<span style="color: #6B7280;">$1</span>');
  }
  
  return code;
}

// 코드 실행 시뮬레이션 컴포넌트
interface CodeRunnerProps {
  code: string;
  language: string;
  onResult: (result: { output?: string; error?: string }) => void;
}

export function CodeRunner({ code, language, onResult }: CodeRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    
    // 시뮬레이션: 실제로는 백엔드 API를 호출해야 함
    setTimeout(() => {
      try {
        if (language === 'python') {
          if (code.includes('print')) {
            const match = code.match(/print\((['"])(.*?)\1\)/);
            if (match) {
              onResult({ output: match[2] });
            } else {
              onResult({ output: '실행 완료' });
            }
          } else if (code.includes('df.head()')) {
            onResult({ 
              output: `   col1  col2  col3
0     1     A    10
1     2     B    20
2     3     C    30
3     4     D    40
4     5     E    50` 
            });
          } else {
            onResult({ output: '코드가 성공적으로 실행되었습니다.' });
          }
        } else {
          onResult({ output: '실행 완료' });
        }
      } catch (error) {
        onResult({ error: '구문 오류가 발생했습니다.' });
      }
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="mt-4">
      <button
        onClick={runCode}
        disabled={isRunning || !code.trim()}
        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
          isRunning || !code.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isRunning ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            실행 중...
          </div>
        ) : (
          <>▶️ 코드 실행</>
        )}
      </button>
    </div>
  );
}