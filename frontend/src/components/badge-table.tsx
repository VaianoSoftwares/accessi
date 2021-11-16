import React from "react";
import { RouteComponentProps } from "react-router";
import { TableContentElem } from "../types/TableContentElem";

interface Props extends RouteComponentProps {
  badges: TableContentElem[];
};

const BadgeTable: React.FC<Props> = (props: Props) => {
  return (
    <div style={{"overflowY":"auto", "height":"300px"}}>
    <table className="badge-table table table-striped">
      <thead style={{"position":"sticky", "top":"0", "zIndex":1, "backgroundColor":"white"}}>
        <tr>
          {props.badges.length > 0 &&
            Object.entries(props.badges[0])
              .filter((elem) => elem[1] !== undefined)
              .map((elem, index) => (
                <th scope="col" key={index} style={{"position":"sticky", "top":"0", "zIndex":1}}>
                  {elem[0]}
                </th>
              ))}
        </tr>
      </thead>
      <tbody className="badge-tbody" style={{"maxHeight":"50px","overflowY":"scroll", "height":"50px"}}>
        {props.badges.length > 0 &&
          props.badges.map((elem, index) => (
            <tr key={index}>
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