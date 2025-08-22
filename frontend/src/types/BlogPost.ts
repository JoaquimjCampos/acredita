export interface BlogPost {
  id: string | number;
  title: string;
  content: string;
  author?: string;
  created_at?: string;
  updated_at?: string;
}
