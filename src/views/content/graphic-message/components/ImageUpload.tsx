import { useState, type ChangeEvent, type DragEvent, type FC } from 'react';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/utils';
import { ACCEPTED_IMAGE_TYPES } from '@/views/content/graphic-message/constants';

interface ImageUploadProps {
  /** 已选图片的文件名 */
  fileName?: string;
  onSelect: (file: File) => void;
}

const ImageUpload: FC<ImageUploadProps> = ({ fileName, onSelect }) => {
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only PNG or JPG images are supported');
      return;
    }
    onSelect(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    // 允许重复选择同一个文件
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center rounded-xl border px-4 py-6 text-center focus-within:border-[#2F6EFF]',
        dragging ? 'border-[#2F6EFF] bg-[#f3f7ff]' : 'border-[#e4e7ee]',
      )}
    >
      <input
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={handleChange}
        className="sr-only"
      />
      <span
        className="grid size-10 place-items-center rounded-lg border border-[#e4e7ee] text-[#5c6170]"
        aria-hidden="true"
      >
        <UploadCloud className="size-5" strokeWidth={1.8} />
      </span>
      <p className="mt-3 text-sm text-[#5c6170]">
        <span className="font-medium text-[#2F6EFF]">Click to upload</span> or drag and drop
      </p>
      <p className="mt-1 text-xs text-[#8a90a0]">{fileName ?? 'PNG, JPG (max. 640x360px)'}</p>
    </label>
  );
};

export default ImageUpload;
