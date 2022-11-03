export const guestReqHeader = {
  "guest-token": sessionStorage.getItem("guest-token"),
};
export const adminReqHeader = {
  "guest-token": sessionStorage.getItem("guest-token"),
  "admin-token": sessionStorage.getItem("admin-token"),
};
export const adminReqFileHeader = {
  "guest-token": sessionStorage.getItem("guest-token"),
  "admin-token": sessionStorage.getItem("admin-token"),
  "Content-Type": "multipart/form-data",
};
