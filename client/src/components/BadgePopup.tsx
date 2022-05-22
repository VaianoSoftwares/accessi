// Modules
import React from "react";
import Popup from "reactjs-popup";
import { PopupPosition } from "reactjs-popup/dist/types";
import BadgeTable from "./BadgeTable";

type Props = {
    content: Array<object>;
    trigger: JSX.Element;
    onOpen: () => void;
    position: PopupPosition;
}

const BadgePopup: React.FC<Props> = (props: Props) => {
  return (
    <Popup
      trigger={props.trigger}
      position={props.position}
      onOpen={props.onOpen}
    >
      {props.content.length > 0 ? (
        <div className="popup-table-wrapper" id="popup-table">
          <BadgeTable content={props.content} />
        </div>
      ) : (
        "Nessun Risultato Trovato"
      )}
    </Popup>
  );
};

export default BadgePopup;