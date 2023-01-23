import DataServices from "./DataServices";

class CalendarioDataService extends DataServices {
  getFilenames(date: string) {
    return super.request({ token: true, data: { date } });
  }

  insertFiles(data: FormData) {
    return super.request({ method: "POST", token: true, files: true, data });
  }

  deleteFile(date: string, filename: string) {
    return super.request({
      method: "DELETE",
      token: true,
      data: { date, filename },
    });
  }
}

export default new CalendarioDataService("/api/v1/calendario");
