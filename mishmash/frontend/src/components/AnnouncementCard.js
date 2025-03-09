import React from "react";
import { styled } from "@mui/material/styles";
import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";

const StyledCard = styled(Card)(({ theme }) => ({
  position: "relative",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: "12px",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
  },
}));

const CardMediaContainer = styled("div")({
  position: "relative",
});

const PinIcon = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  color: theme.palette.primary.main,
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  borderRadius: "50%",
  padding: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1,
}));

const DateText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
  marginTop: theme.spacing(0.5),
}));

const CardContentStyled = styled(CardContent)({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
});

const TruncatedTypography = styled(Typography)({
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const AnnouncementCard = ({ announcement, onClick }) => {
  const formattedDate = announcement?.created_at
    ? new Date(announcement.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <StyledCard onClick={onClick} sx={{ cursor: "pointer" }}>
      <CardMediaContainer>
        {announcement.cover_image_url && (
          <CardMedia
            component="img"
            height="140"
            image={announcement.cover_image_url}
            alt={announcement.title}
          />
        )}
        {announcement.pinned && (
          <PinIcon>
            <PushPinIcon fontSize="small" />
          </PinIcon>
        )}
      </CardMediaContainer>
      <CardContentStyled>
        <TruncatedTypography variant="h6" component="h2" gutterBottom>
          {announcement.title}
        </TruncatedTypography>
        <DateText>{formattedDate}</DateText>
      </CardContentStyled>
    </StyledCard>
  );
};

export default AnnouncementCard;
