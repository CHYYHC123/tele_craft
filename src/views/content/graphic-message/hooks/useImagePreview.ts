import { useCallback, useEffect, useRef, useState } from 'react';

export interface ImagePreview {
  url: string;
  name: string;
}

/**
 * 选中本地图片后生成预览地址，并在替换/卸载时释放旧地址。
 * initialImage 为服务端已保存的图片（远程地址，无需释放）。
 */
export const useImagePreview = (initialImage: ImagePreview | null = null) => {
  const [image, setImage] = useState<ImagePreview | null>(initialImage);
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
