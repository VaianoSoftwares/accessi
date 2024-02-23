import dateFormat from "dateformat";

export class TableContentMapper {
  static toStrDate(date: Date | string) {
    return new Date(date).toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
    });
  }

  static parseDate(elements: Record<PropertyKey, any>[]) {
    elements.forEach((el, i) =>
      Object.entries(el)
        .filter(([key]) => ["data_in", "data_out", "scadenza"].includes(key))
        .forEach(([key, value]) => {
          switch (key) {
            case "data_in":
            case "data_out":
              elements[i][key] = value
                ? TableContentMapper.toStrDate(new Date(value))
                : "";
              break;
            case "scadenza":
              elements[i][key] = value
                ? dateFormat(new Date(value), "yyyy-mm-dd")
                : "";
          }
        })
    );
  }
}
