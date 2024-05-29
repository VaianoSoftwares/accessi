import "./index.css";
import dateFormat from "dateformat";
import { HTMLElementEvent } from "../../types";

export default function BadgeTable({
  clickRowEvent,
  ...props
}: {
  content: Record<PropertyKey, any>[];
  tableId?: string;
  keyAttribute?: string;
  omitedParams?: string[];
  obfuscatedParams?: string[];
  timestampParams?: string[];
  dateParams?: string[];
  linkParams?: string[];
  linkParser?: (value: any) => any;
  clickRowEvent?: (e: HTMLElementEvent) => void;
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
    else if (props?.linkParams?.includes?.(key))
        return props?.linkParser?.(value);
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
                  clickRowEvent === undefined
                    ? "badge-table-tr"
                    : "badge-table-tr clickable-tr"
                }
                onClick={
                  clickRowEvent === undefined
                    ? undefined
                    : (e) => clickRowEvent(e as any)
                }
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
