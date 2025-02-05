import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Paper,
  Typography,
  Pagination,
  Box,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axiosInstance from '../utils/axios';

const ViewerContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  minHeight: '300px',
  borderRadius: theme.shape.borderRadius.large,
  boxShadow: theme.customShadows.card,
  overflow: 'hidden',
}));

const NavigationOverlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const LeftNavigation = styled(NavigationOverlay)({
  left: 0,
});

const RightNavigation = styled(NavigationOverlay)({
  right: 0,
});

const ContentContainer = styled('div')(({ theme }) => ({
  margin: '0 40px',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const ImportanceBadge = styled(Chip)(({ theme, importance }) => {
  const getColors = () => {
    switch (importance) {
      case 'urgent':
        return {
          bg: theme.palette.status.error.background,
          color: theme.palette.status.error.main,
        };
      case 'high':
        return {
          bg: theme.palette.status.warning.background,
          color: theme.palette.status.warning.main,
        };
      case 'medium':
        return {
          bg: theme.palette.status.info.background,
          color: theme.palette.status.info.main,
        };
      case 'low':
        return {
          bg: theme.palette.status.success.background,
          color: theme.palette.status.success.main,
        };
      default:
        return {
          bg: theme.palette.grey[100],
          color: theme.palette.grey[700],
        };
    }
  };

  const colors = getColors();
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 500,
    '& .MuiChip-label': {
      padding: '0 12px',
    },
  };
});

const AnnouncementHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
}));

const TitleSection = styled('div')(({ theme }) => ({
  flex: 1,
}));

const TitleRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: theme.spacing(2),
  marginBottom: 0,
}));

const DateText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  whiteSpace: 'nowrap',
}));

const BadgeSection = styled('div')({
  marginLeft: 'auto',
});

const MetaSection = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: theme.spacing(1),
}));

const PageIndicator = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius.medium,
  boxShadow: theme.customShadows.card,
}));

const AnnouncementsViewer = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get('/api/announcements/');
      setAnnouncements(response.data.filter(a => a.is_active));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (editor && announcements.length > 0) {
      const currentAnnouncement = announcements[currentPage - 1];
      editor.commands.setContent(currentAnnouncement.content);
    }
  }, [currentPage, announcements, editor]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < announcements.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <ViewerContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      </ViewerContainer>
    );
  }

  if (!announcements.length) {
    return (
      <ViewerContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <Typography variant="body1" color="textSecondary">
            No announcements available
          </Typography>
        </Box>
      </ViewerContainer>
    );
  }

  const currentAnnouncement = announcements[currentPage - 1];

  return (
    <ViewerContainer>
      <LeftNavigation onClick={handlePrevious} style={{ opacity: currentPage > 1 ? 1 : 0.3 }}>
        <ChevronLeftIcon />
      </LeftNavigation>
      
      <RightNavigation onClick={handleNext} style={{ opacity: currentPage < announcements.length ? 1 : 0.3 }}>
        <ChevronRightIcon />
      </RightNavigation>

      <ContentContainer>
        <AnnouncementHeader>
          <TitleSection>
            <TitleRow>
              <Typography variant="h5" component="h2">
                {currentAnnouncement.title}
              </Typography>
              <DateText variant="body2">
                {new Date(currentAnnouncement.created_at).toLocaleDateString()}
              </DateText>
            </TitleRow>
          </TitleSection>
          <BadgeSection>
            <ImportanceBadge
              label={currentAnnouncement.importance.charAt(0).toUpperCase() + currentAnnouncement.importance.slice(1)}
              importance={currentAnnouncement.importance}
            />
          </BadgeSection>
        </AnnouncementHeader>

        <EditorContent editor={editor} />

        <PageIndicator>
          {currentPage} / {announcements.length}
        </PageIndicator>
      </ContentContainer>
    </ViewerContainer>
  );
};

export default AnnouncementsViewer;
