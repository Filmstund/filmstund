import React from "react";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

const modalOverlayStyle = {
  zIndex: 2,
};
const modalContentStyle = {
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
  backgroundColor: "white",
};

const Modal = ({ children, ...props }) => (
  <ReactModal
    isOpen={true}
    style={{ content: modalContentStyle, overlay: modalOverlayStyle }}
    {...props}
  >
    {children}
  </ReactModal>
);

export default Modal;
