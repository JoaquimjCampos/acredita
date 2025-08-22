export interface Participant {
  id: string;
  nome: string;
  idade: number;
  provincia: string;
  foto_perfil?: string | null;
  total_votos?: number;
}
