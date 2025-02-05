import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
  Typography,
  IconButton,
  Box,
  Chip,
  useTheme,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import axiosInstance from '../utils/axios';

const ViewerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius.large,
  boxShadow: theme.customShadows.card,
  position: 'relative',
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column',
}));

const AnnouncementHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const ImportanceChip = styled(Chip)(({ theme, importance }) => {
  const getColor = () => {
    switch (importance) {
      case 'urgent':
        return theme.palette.error;
      case 'high':
        return theme.palette.warning;
      case 'medium':
        return theme.palette.info;
      default:
        return theme.palette.success;
    }
  };

  const color = getColor();

  return {
    backgroundColor: color.light,
    color: color.main,
    fontWeight: 500,
  };
});

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.customShadows.button,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
  },
}));

const ContentContainer = styled(Box)({
  flex: 1,
  overflow: 'auto',
});

const StyledEditorContent = styled(EditorContent)(({ theme }) => ({
  '& .ProseMirror': {
    '& p': {
      margin: '0.5em 0',
    },
    '& h1': {
      fontSize: '1.5em',
      fontWeight: 'bold',
      margin: '1em 0 0.5em',
    },
    '& ul, & ol': {
      padding: '0 1rem',
    },
  },
}));

const DateText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}));

const AnnouncementsViewer = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (editor && announcements[currentIndex]) {
      editor.commands.setContent(announcements[currentIndex].content);
    }
  }, [currentIndex, announcements, editor]);

  const fetchAnnouncements = async () => {
    try {
      const response = await axiosInstance.get('/api/announcements/');
      setAnnouncements(response.data.filter(a => a.is_active));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, announcements.length - 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handlePageChange = (event, page) => {
    setCurrentIndex(page - 1);
  };

  if (loading) {
    return (
      <ViewerContainer sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </ViewerContainer>
    );
  }

  if (!announcements.length) {
    return (
      <ViewerContainer sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No announcements available
        </Typography>
      </ViewerContainer>
    );
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <ViewerContainer>
      <AnnouncementHeader>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            {currentAnnouncement.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ImportanceChip
              label={currentAnnouncement.importance.toUpperCase()}
              importance={currentAnnouncement.importance}
              size="small"
            />
            <DateText>
              {new Date(currentAnnouncement.created_at).toLocaleDateString()}
            </DateText>
          </Box>
        </Box>
      </AnnouncementHeader>

      <ContentContainer>
        <StyledEditorContent editor={editor} />
      </ContentContainer>

      {announcements.length > 1 && (
        <>
          <NavigationButton
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            sx={{ left: theme.spacing(1) }}
          >
            <NavigateBeforeIcon />
          </NavigationButton>

          <NavigationButton
            onClick={handleNext}
            disabled={currentIndex === announcements.length - 1}
            sx={{ right: theme.spacing(1) }}
          >
            <NavigateNextIcon />
          </NavigationButton>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={announcements.length}
              page={currentIndex + 1}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </ViewerContainer>
  );
};

export default AnnouncementsViewer;
