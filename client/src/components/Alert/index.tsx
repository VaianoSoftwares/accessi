import React from "react";

import "./index.css";

import { TAlert } from "../../types/TAlert";

type Props = {
  alert: TAlert | null;
  closeAlert: () => void;
};

const Alert: React.FC<Props> = (props: Props) => {
  return (
    props.alert && (
        <div
          className={
            "alert alert-" +
            (props.alert.success === true ? "success" : "danger") +
            " alert-dismissible fade show alert-custom"
          }
          role="alert"
        >
          <span className="alert-custom-component">
            <strong>
              {props.alert.success === true ? "SUCCESS" : "ERROR"}
            </strong>
          </span>
          <span className="alert-custom-component">
            {props.alert.msg.replace("Error:", "").slice(0, 220)}
          </span>
          <span>
            <button
              type="button"
              className="close"
              data-dismiss="alert"
              aria-label="Close"
              onClick={() => props.closeAlert()}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </span>
        </div>
    )
  );
};

export default Alert;
