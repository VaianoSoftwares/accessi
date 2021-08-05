import React from "react";

const Alert = (props) => {
  return (
    props.alert && (
      <div
        className={
          props.alert.success === true
            ? "alert alert-success alert-dismissible fade show"
            : "alert alert-danger alert-dismissible fade show"
        }
        role="alert"
      >
        <strong>{props.alert.success === true ? "Success" : "Error"}</strong> {props.alert.msg} <button
          type="button"
          className="close"
          data-dismiss="alert"
          aria-label="Close"
          onClick={() => props.setAlert(null)}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    )
  );
};

export default Alert;