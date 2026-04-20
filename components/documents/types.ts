export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
}

export interface DocItem {
  id: string;
  name: string;
  fileName: string;
  /** Client-side blob URL for view/download (revoked when the row is deleted). */
  blobUrl: string;
  folderId: string | null;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
}
