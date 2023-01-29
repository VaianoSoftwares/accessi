import React from "react";
import "./index.css";

type Props = {
  content: object[];
  tableId?: string;
  omitedParams?: string[];
  obfuscatedParams?: string[]; 
};

const BadgeTable: React.FC<Props> = (props: Props) => {
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
                .map((key, i) => (
                  <th scope="col" key={i} className="badge-table-th">
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
                    {props?.obfuscatedParams?.includes?.(key)
                      ? "XXXXX"
                      : value || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default BadgeTable;