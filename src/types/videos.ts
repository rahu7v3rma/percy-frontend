export interface Video {
    _id: string;
    id?: string;
    title: string;
    fileSize: number;
    url: string;
    createdAt: string;
    views: number;
    description?: string;
    thumbnail?: string;
    thumbnailUrl?: string;
    folderId?: string | null;
    duration?: number;
}