import {
  ALL_PAYMENT_STATUSES,
  getPaymentStatusLabel,
  ALL_PAYMENT_APPLICATION_STATUSES,
} from "../utils/constants";
import { TextField, MenuItem } from "@mui/material";
const PaymentStatusDropDown = ({ applicant, handlePaymentStatus }) => {
  return (
    <>
      {ALL_PAYMENT_APPLICATION_STATUSES.includes(applicant.status) && (
        <TextField
          select
          size="small"
          value={applicant.payment_status}
          onChange={(e) =>
            handlePaymentStatus(e, applicant.id, applicant.payment_status)
          }
          onClick={(e) => e.stopPropagation()}
          sx={{
            minWidth: "100px",
            "& .MuiSelect-select": {
              padding: "4px 6px",
              fontSize: "0.8125rem",
            },
            "& .MuiSelect-icon": {
              right: "2px",
            },
          }}
        >
          {Object.keys(ALL_PAYMENT_STATUSES).map((status, index) => (
            <MenuItem key={index} value={status}>
              {getPaymentStatusLabel(status)}
            </MenuItem>
          ))}
        </TextField>
      )}
      {!ALL_PAYMENT_APPLICATION_STATUSES.includes(applicant.status) && (
        <h3> N/A </h3>
      )}
    </>
  );
};

export default PaymentStatusDropDown;
