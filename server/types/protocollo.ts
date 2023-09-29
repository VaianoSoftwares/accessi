import { Binary, ObjectId } from "mongodb";

export type ProtocolloFile = {
  filename: string;
  descrizione: string;
  data: Date | string;
  visibileDa: ObjectId[];
};

export type ProtocolloFindReq = Partial<Omit<ProtocolloFile, "data">> & {
  dataInizio?: Date | string;
  dataFine?: Date | string;
};
export type ProtocolloAddReq = Omit<
  ProtocolloFindReq & Pick<ProtocolloFile, "filename" | "visibileDa">,
  "data"
>;
