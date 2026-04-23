import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { SectionCard } from '@/features/proposal/components/shared/SectionCard';

interface FileUploadSectionProps {
  onFileSelected: (file: File) => void;
  currentFile: File | null;
}

export function FileUploadSection({ onFileSelected, currentFile }: FileUploadSectionProps) {
  const onDrop = useCallback(
    (accepted: File[]) => { if (accepted.length > 0) onFileSelected(accepted[0]); },
    [onFileSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  return (
    <SectionCard id="upload" title="Upload Census / Payroll File" subtitle="Upload your employee data for a high-accuracy analysis">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed p-12 text-center cursor-pointer transition-all
          ${isDragActive
            ? 'border-accent bg-accent-glow'
            : 'border-border-glass-light hover:border-accent/40 hover:bg-surface-glass-light'}`}
      >
        <input {...getInputProps()} />
        {currentFile ? (
          <>
            <FileSpreadsheet className="h-10 w-10 text-accent mb-3" />
            <p className="text-[14px] font-semibold text-text-primary">{currentFile.name}</p>
            <p className="text-[13px] text-text-tertiary mt-1">{(currentFile.size / 1024).toFixed(1)} KB — Click or drop to replace</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-text-tertiary mb-3" />
            <p className="text-[14px] font-semibold text-text-primary">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your census file'}
            </p>
            <p className="text-[13px] text-text-tertiary mt-1">or click to browse — CSV, XLS, XLSX</p>
          </>
        )}
      </div>
    </SectionCard>
  );
}
