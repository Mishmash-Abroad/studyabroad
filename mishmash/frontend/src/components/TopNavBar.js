import React from "react";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import FaceIcon from "@mui/icons-material/Face";
import LockIcon from "@mui/icons-material/Lock";
import { Link } from "react-router-dom";

function TopNavBar() {
  return (
    <>
      <Paper elevation={3}>
        {" "}
        <Link to="/register">
          <Chip
            icon={<FaceIcon />}
            label="Sign up"
            color="primary"
            variant="outlined"
          ></Chip>{" "}
        </Link>
        <Link to="/login">
          <Chip
            icon={<LockIcon />}
            label="Log in"
            color="primary"
            variant="outlined"
          ></Chip>
        </Link>
      </Paper>
    </>
  );
}

export default TopNavBar;
