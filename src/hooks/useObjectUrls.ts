import { useCallback, useEffect, useRef } from 'react';

/** 按 id 管理本地图片的预览地址：替换 / 释放时 revoke 旧地址，卸载时全部释放 */
export const useObjectUrls = () => {
  const urls = useRef(new Map<number, string>());

  useEffect(() => {
    const map = urls.current;
    return () => {
      map.forEach((url) => URL.revokeObjectURL(url));
      map.clear();
    };
  }, []);

  const replace = useCallback((id: number, file: File) => {
    const previous = urls.current.get(id);
    if (previous) URL.revokeObjectURL(previous);

    const url = URL.createObjectURL(file);
    urls.current.set(id, url);
    return url;
  }, []);

  const release = useCallback((id: number) => {
    const url = urls.current.get(id);
    if (!url) return;
    URL.revokeObjectURL(url);
    urls.current.delete(id);
  }, []);

  return { replace, release };
};
