import React from "react";

const BadgeTable = props => {
  return (
    //<iframe title="badge-table">
    <table className="table table-striped">
      <thead>
        <tr>
          {props.badges.length > 0 &&
            Object.entries(props.badges[0]).map((elem, index) => (
              elem[1] !== undefined &&
                <th scope="col" key={index}>{elem[0]}</th>
            ))}
        </tr>
      </thead>
      <tbody>
        {props.badges.length > 0 &&
          props.badges.map((elem, index) => (
            <tr key={index}>
              {Object.values(elem).map((value, _index) =>
                value !== undefined && 
                  <td key={_index}>{value}</td>
              )}
            </tr>
          ))}
      </tbody>
    </table>
    //</iframe>
  );
};

export default BadgeTable;