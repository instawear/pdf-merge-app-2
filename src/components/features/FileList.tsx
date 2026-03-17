import { useCallback, useRef, useState } from 'react';
import { PDFFile } from '@/types';
import FileItem from './FileItem';

interface FileListProps {
  files: PDFFile[];
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  formatSize: (bytes: number) => string;
}

export default function FileList({ files, onRemove, onReorder, formatSize }: FileListProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggingIndex(index);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = draggingIndex;
    if (fromIndex !== null && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, [draggingIndex, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index > 0) onReorder(index, index - 1);
  }, [onReorder]);

  const moveDown = useCallback((index: number) => {
    if (index < files.length - 1) onReorder(index, index + 1);
  }, [onReorder, files.length]);

  return (
    <div className="space-y-2" role="list" aria-label="PDF files to merge">
      {files.map((file, index) => (
        <div
          key={file.id}
          role="listitem"
          draggable
          onDragStart={e => handleDragStart(e, index)}
          onDragEnter={e => handleDragEnter(e, index)}
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`transition-all duration-150 ${
            dragOverIndex === index && draggingIndex !== index
              ? 'scale-[1.02] opacity-80'
              : ''
          }`}
        >
          <FileItem
            file={file}
            index={index}
            total={files.length}
            onRemove={onRemove}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            isDragging={draggingIndex === index}
            formatSize={formatSize}
          />
        </div>
      ))}
    </div>
  );
}
