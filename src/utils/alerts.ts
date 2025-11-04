// Alertas con SweetAlert2
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "animate.css";

const MySwal = withReactContent(Swal);

export function alertSuccess(title: string, text?: string) {
    return MySwal.fire({
        title,
        text,
        icon: "success",
        timer: 2200,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: false,
        position: "center",
        background: "var(--sf-surface, #1f1f1f)",
        color: "var(--sf-text, #f5f5f5)",
        customClass: {
            popup: "sf-swal-popup",
            title: "sf-swal-title",
            htmlContainer: "sf-swal-text",
        },
        showClass: {
            popup: "animate__animated animate__fadeInDown animate__faster",
        },
        hideClass: {
            popup: "animate__animated animate__fadeOutUp animate__faster",
        },
    });
}

export function alertError(title: string, text?: string) {
    return MySwal.fire({
        title,
        text,
        icon: "error",
        confirmButtonText: "Entendido",
        background: "var(--sf-surface, #1f1f1f)",
        color: "var(--sf-text, #f5f5f5)",
        customClass: {
            popup: "sf-swal-popup",
            title: "sf-swal-title",
            htmlContainer: "sf-swal-text",
            confirmButton: "sf-swal-btn",
        },
        showClass: {
            popup: "animate__animated animate__zoomIn animate__faster",
        },
        hideClass: {
            popup: "animate__animated animate__zoomOut animate__faster",
        },
    });
}

export async function alertConfirm(
  title: string,
  text?: string,
  confirmButtonText = "Sí",
  cancelButtonText = "Cancelar"
): Promise<boolean> {
  const r = await MySwal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    background: "var(--sf-surface, #1f1f1f)",
    color: "var(--sf-text, #f5f5f5)",
    customClass: {
      popup: "sf-swal-popup",
      title: "sf-swal-title",
      htmlContainer: "sf-swal-text",
      confirmButton: "sf-swal-btn",
      cancelButton: "sf-swal-btn",
    },
    showClass: { popup: "animate__animated animate__fadeIn animate__faster" },
    hideClass: { popup: "animate__animated animate__fadeOut animate__faster" },
  });
  return !!r.isConfirmed;
}
