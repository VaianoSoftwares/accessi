import React from "react";
import { Nullable } from "../types/Nullable";
import { TAlert } from "../types/TAlert";

type Props = {
  alert: Nullable<TAlert>;
  setAlert: React.Dispatch<React.SetStateAction<Nullable<TAlert>>>;
};

const Alert: React.FC<Props> = (props: Props) => {
  return (
    props.alert && (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className={
            "alert alert-" +
            (props.alert.success === true ? "success" : "danger") +
            " alert-dismissible fade show "
          }
          role="alert"
        >
          <strong>{props.alert.success === true ? "Success" : "Error"}</strong>{" "}
          {props.alert.msg.replace("Error:", "")}{" "}
          <button
            type="button"
            className="close"
            data-dismiss="alert"
            aria-label="Close"
            onClick={() => props.setAlert(null)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
    )
  );
};

export default Alert;
