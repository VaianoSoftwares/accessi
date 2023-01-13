import React from "react";
import "./index.css";

type Props = {
  content: Array<object>;
  tableId?: string;
};

const BadgeTable: React.FC<Props> = (props: Props) => {
  return (
    <>
      {props.content.length > 0 && <table className="badge-table table table-striped" id={props.tableId}>
        <thead className="badge-table-thead">
          <tr className="badge-table-tr">
            {Object.keys(props.content[0]).map((keys, index) => (
              <th scope="col" key={index} className="badge-table-th">
                {keys}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="badge-table-tbody">
          {props.content.map((elem, index) => (
            <tr key={index} className="badge-table-tr">
              {Object.values(elem).map((value, _index) => (
                <td className="badge-table-td" key={_index}>{value || ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      }
    </>
  );
};

export default BadgeTable;