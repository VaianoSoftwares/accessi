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
    //<iframe title="badge-table">
    <table className="badge-table table table-striped">
      <thead>
        <tr>
          {props.badges.length > 0 &&
            Object.entries(getLongestBadge())
              .filter((elem) => elem[1] !== undefined)
              .map((elem, index) => (
                <th scope="col" key={index}>
                  {elem[0]}
                </th>
              ))}
        </tr>
      </thead>
      <tbody>
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
    //</iframe>
  );
};

export default BadgeTable;