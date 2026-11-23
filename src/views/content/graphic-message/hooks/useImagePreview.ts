import { useCallback, useEffect, useRef, useState } from 'react';

interface ImagePreview {
  url: string;
  name: string;
}

/** 选中本地图片后生成预览地址，并在替换/卸载时释放旧地址 */
export const useImagePreview = () => {
  const [image, setImage] = useState<ImagePreview | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const select = useCallback((file: File) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setImage({ url, name: file.name });
  }, []);

  return { image, select };
};
