import "./index.css";

export default function BadgeTable(props: {
  content: object[];
  tableId?: string;
  omitedParams?: string[];
  obfuscatedParams?: string[];
  dateParams?: string[];
}) {
  function displayTableRowValue({ key, value }: { key: string; value: any }) {
    if (props?.obfuscatedParams?.includes?.(key)) return "XXXXX";
    else if (props?.dateParams?.includes?.(key))
      return new Date(value).toLocaleString("it-IT", {
        timeZone: "Europe/Rome",
      });
    else return value || "";
  }

  return (
    <>
      {props.content.length > 0 && (
        <table className="badge-table table table-striped" id={props.tableId}>
          <thead className="badge-table-thead">
            <tr className="badge-table-tr">
              {Object.keys(props.content[0])
                .filter(
                  (key) =>
                    !(props.omitedParams && props.omitedParams.includes(key))
                )
                .map((key) => (
                  <th scope="col" key={key} className="badge-table-th">
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="badge-table-tbody">
            {props.content.map((elem, i) => (
              <tr key={i} className="badge-table-tr">
                {Object.entries(elem).map(([key, value], j) => (
                  <td className="badge-table-td" key={j}>
                    {displayTableRowValue({ key, value })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
