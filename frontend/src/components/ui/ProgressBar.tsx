interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  current, 
  total, 
  className = "",
  showPercentage = false 
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-gray-600">
            {percentage}% 완료
          </span>
        </div>
      )}
    </div>
  );
}