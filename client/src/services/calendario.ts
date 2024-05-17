import { GenericAbortSignal } from "axios";
import DataServices from "./DataServices";

class CalendarioDataService extends DataServices {
  // getFilenames(date: string, signal?: GenericAbortSignal) {
  //   return super.request({ token: true, data: { date }, signal });
  // }
  // insertFiles(data: FormData, signal?: GenericAbortSignal) {
  //   return super.request({
  //     method: "POST",
  //     token: true,
  //     files: true,
  //     data,
  //     signal,
  //   });
  // }
  // deleteFile(
  //   { date, filename }: { date: string; filename: string },
  //   signal?: GenericAbortSignal
  // ) {
  //   return super.request({
  //     method: "DELETE",
  //     token: true,
  //     data: { date, filename },
  //     signal,
  //   });
  // }
}

export default new CalendarioDataService("/api/v1/calendario");
