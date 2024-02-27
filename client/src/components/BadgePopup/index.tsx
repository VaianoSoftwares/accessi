// Modules
import Popup from "reactjs-popup";
import { PopupPosition } from "reactjs-popup/dist/types";
import BadgeTable from "../BadgeTable";

export default function BadgePopup(props: {
  content: object[];
  trigger: JSX.Element;
  onOpen: () => void;
  position: PopupPosition;
}) {
  return (
    <Popup
      trigger={props.trigger}
      position={props.position}
      onOpen={props.onOpen}
    >
      {props.content.length > 0 ? (
        <div className="popup-table-wrapper" id="popup-table">
          <BadgeTable
            content={props.content}
            dateParams={["data_in", "data_out"]}
          />
        </div>
      ) : (
        "Nessun Risultato Trovato"
      )}
    </Popup>
  );
}
