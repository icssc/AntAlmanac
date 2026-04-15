import { useAppSelector } from '../store/hooks';

export function useCurrentPreview() {
  const previews = useAppSelector((state) => state.preview.previewStack);

  const currentPreview = previews.length > 0 ? previews[previews.length - 1] : null;
  return currentPreview;
}
