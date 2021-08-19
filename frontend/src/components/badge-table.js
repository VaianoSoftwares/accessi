import React from "react";

const BadgeTable = props => {
  const getLongestBadge = () => {
    return props.badges.reduce((prev, curr) =>
      Object.entries(prev).filter((entry) => entry[1] !== undefined).length >
      Object.entries(curr).filter((entry) => entry[1] !== undefined).length
        ? prev
        : curr
    );
  };

  return (
    <div style={{"overflowY":"auto", "height":"175px"}}>
    <table className="badge-table table table-striped">
      <thead style={{"position":"sticky", "top":"0", "zIndex":"1", "backgroundColor":"white"}}>
        <tr>
          {props.badges.length > 0 &&
            Object.entries(getLongestBadge())
              .filter((elem) => elem[1] !== undefined)
              .map((elem, index) => (
                <th scope="col" key={index} style={{"position":"sticky", "top":"0", "zIndex":"1"}}>
                  {elem[0]}
                </th>
              ))}
        </tr>
      </thead>
      <tbody className="badge-tbody" style={{"maxHeight":"200px","overflowY":"scroll", "height":"200px"}}>
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