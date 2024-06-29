import { WithId } from ".";

export type Postazione = WithId<{
  cliente: string;
  name: string;
}>;

export type GetPostazioniFilters = { ids?: number[] };
export type InsertPostazioneData = Omit<Postazione, "id">;
