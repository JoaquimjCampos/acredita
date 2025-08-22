export interface Ad {
  id: number;
  title: string;
  image_url: string;
  link: string;
  description?: string;
  active: boolean;
  type?: string; // banner, video, popup, etc.
}
