import { MouseEventHandler } from "react";
import "./index.css";
import dateFormat from "dateformat";

export default function BadgeTable(props: {
  content: Record<PropertyKey, any>[];
  tableId?: string;
  omitedParams?: string[];
  obfuscatedParams?: string[];
  timestampParams?: string[];
  dateParams?: string[];
  keyAttribute?: string;
  clickRowEvent?: MouseEventHandler;
}) {
  function parseTableTdContent({ key, value }: { key: string; value: any }) {
    if (props?.obfuscatedParams?.includes?.(key)) return "XXXXX";
    else if (value === "" || value === null || value === undefined) return "";
    else if (props?.dateParams?.includes?.(key))
      return dateFormat(value, "dd/mm/yyyy");
    else if (props?.timestampParams?.includes?.(key))
      return new Date(value).toLocaleString("it-IT", {
        timeZone: "Europe/Rome",
      });
    else return value;
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
                    props.omitedParams === undefined ||
                    props.omitedParams.includes(key) === false
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
              <tr
                key={i}
                className={
                  props.clickRowEvent === undefined
                    ? "badge-table-tr"
                    : "badge-table-tr clickable-tr"
                }
                onClick={props.clickRowEvent}
                data-key={
                  props.keyAttribute &&
                  props.keyAttribute in elem &&
                  elem[props.keyAttribute]
                }
              >
                {Object.entries(elem)
                  .filter(
                    ([key]) =>
                      !(props.omitedParams && props.omitedParams.includes(key))
                  )
                  .map(([key, value], j) => (
                    <td className="badge-table-td" key={j}>
                      {parseTableTdContent({ key, value })}
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
