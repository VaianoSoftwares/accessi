import React from "react";
import "./index.css";
import { TableContentElem } from "../../types/TableContentElem";

type Props = {
  badges: TableContentElem[];
};

const BadgeTable: React.FC<Props> = (props: Props) => {
  return (
    <div className="badge-table-wrapper">
    <table className="badge-table table table-striped" id="badge-table">
      <thead className="badge-table-thead">
        <tr className="badge-table-tr">
          {props.badges.length > 0 &&
            Object.entries(props.badges[0])
              .filter((elem) => elem[1] !== undefined)
              .map((elem, index) => (
                <th scope="col" key={index} className="badge-table-th">
                  {elem[0]}
                </th>
              ))}
        </tr>
      </thead>
      <tbody className="badge-table-tbody">
        {props.badges.length > 0 &&
          props.badges.map((elem, index) => (
            <tr key={index} className="badge-table-tr">
              {Object.values(elem)
                .filter((value) => value !== undefined)
                .map((value, _index) => (
                  <td key={_index}>{value}</td>
                ))}
            </tr>
          ))}
      </tbody>
    </table>
    </div>
  );
};

export default BadgeTable;