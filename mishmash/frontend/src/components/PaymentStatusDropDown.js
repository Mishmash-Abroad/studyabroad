import {
  ALL_PAYMENT_STATUSES,
  getPaymentStatusLabel,
  ALL_PAYMENT_APPLICATION_STATUSES,
} from "../utils/constants";
import { TextField, MenuItem, TableCell } from "@mui/material";
const PaymentStatusDropDown = ({
  applicant,
  disabled,
  handlePaymentStatus,
}) => {
  return (
    <TableCell style={{ padding: "6px 4px" }}>
      {ALL_PAYMENT_APPLICATION_STATUSES.includes(applicant.status) && (
        <TextField
          select
          size="small"
          value={applicant.payment_status}
          disabled={disabled}
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
    </TableCell>
  );
};

export default PaymentStatusDropDown;
