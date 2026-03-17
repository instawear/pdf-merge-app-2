import { useCallback, useState } from 'react';
import { ImageFile } from '@/hooks/useImageFiles';
import ImageItem from './ImageItem';

interface ImageListProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  formatSize: (bytes: number) => string;
}

export default function ImageList({ images, onRemove, onReorder, formatSize }: ImageListProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggingIndex(index);
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
    if (index < images.length - 1) onReorder(index, index + 1);
  }, [onReorder, images.length]);

  return (
    <div className="space-y-2" role="list" aria-label="Images to convert">
      {images.map((image, index) => (
        <div
          key={image.id}
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
          <ImageItem
            image={image}
            index={index}
            total={images.length}
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
