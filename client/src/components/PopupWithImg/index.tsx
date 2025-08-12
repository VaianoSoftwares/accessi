import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  imgSrc: string;
  bgColor: string;
  textColor: string;
  textMsg: string;
  autocloseTimeMs?: number;
};

const styles: { [key: string]: React.CSSProperties } = {
  popup: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "15px 20px",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    animation: "slideIn 0.4s ease forwards",
    zIndex: 9999,
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  image: {
    width: "128px",
    height: "128px",
    flexShrink: 0,
    borderRadius: "5px",
    aspectRatio: "1 / 1",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  text: {
    margin: 0,
    fontSize: "38px",
    fontWeight: "bold",
    color: "rgba(220, 220, 220, 255)",
  },
};

export default function PopupWithImg({
  isOpen,
  onClose,
  imgSrc,
  bgColor,
  textColor,
  textMsg,
  autocloseTimeMs = 3000,
}: Props) {
  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isOpen) {
      timer = setTimeout(onClose, autocloseTimeMs);
    }
    return () => clearTimeout(timer);
  }, [isOpen, onClose, autocloseTimeMs]);

  if (!isOpen) return null;

  return (
    <div style={{ ...styles.popup, backgroundColor: bgColor }}>
      <div style={{ ...styles.image, backgroundImage: `url(${imgSrc})` }}></div>
      <p style={{ ...styles.text, color: textColor }}>{textMsg}</p>
    </div>
  );
}
