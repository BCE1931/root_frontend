import React from "react";
import { Trash2 } from "lucide-react";

export default function ConfirmModal({ nodeText, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrap">
          <Trash2 size={26} />
        </div>
        <h3 className="confirm-title">Delete Node?</h3>
        <p className="confirm-message">
          You're about to delete <strong>"{nodeText}"</strong> and all its
          children. This action cannot be undone.
        </p>
        <div className="confirm-actions">
          <button className="btn-confirm-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-confirm-delete" onClick={onConfirm}>
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
// root_backend is my sring boot applicatin which is
//   a bckend application tot his one which is
//   onepend in intellijidea noe onnect the se two .
//   to store the data int nodes and connected nodes
//   to it in db whcih is connected in spring boot
//   application and do crud operation if we crearte
//   new node then need to stire that nodde in sql ,
//   if we strt website then get all node details rom
//   contens of the od ein froentend then it
//   automatically upadted in backend. if we delete the
//    nodes in froentnend athen it need to delte in
//   backend . access boteh beakcned and froend and
//   make chages . current ui is better dont chage that
