import React from "react";

const BadgeTable = props => {
  return (
    <div style={{"overflowY":"auto", "height":"300px"}}>
    <table className="badge-table table table-striped">
      <thead style={{"position":"sticky", "top":"0", "zIndex":"1", "backgroundColor":"white"}}>
        <tr>
          {props.badges.length > 0 &&
            Object.entries(props.badges[0])
              .filter((elem) => elem[1] !== undefined)
              .map((elem, index) => (
                <th scope="col" key={index} style={{"position":"sticky", "top":"0", "zIndex":"1"}}>
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