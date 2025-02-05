import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axiosInstance from '../utils/axios';
import {
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  Box,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// -------------------- STYLES --------------------
const ViewerContainer = styled('div')({
  position: 'relative',
  width: '100%',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  overflow: 'hidden',
});

const ContentContainer = styled('div')(({ theme }) => ({
  margin: '0 40px',
  padding: theme.spacing(3),
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
}));

const AnnouncementContent = styled('div')(({ theme, expanded, needsExpansion }) => ({
  position: 'relative',
  maxHeight: expanded ? 'none' : '300px',
  overflow: 'hidden',
  transition: 'max-height 0.3s ease-out',
  '&::after': (!expanded && needsExpansion) ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100px',
    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
    pointerEvents: 'none',
  } : {},
}));

const BottomControls = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  position: 'relative',
  bottom: 0,
  width: '100%',
}));

const PageIndicator = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  ...(theme.typography.body2),
}));

const ShowMoreButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
}));

const LeftNavigation = styled('div')({
  position: 'absolute',
  left: 0,
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
});

const RightNavigation = styled('div')({
  position: 'absolute',
  right: 0,
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

const AnnouncementsViewer = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
    content: '',
    onUpdate: () => {
      // Check content height after editor updates
      checkExpansion();
    },
  });

  const checkExpansion = () => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      setNeedsExpansion(scrollHeight > clientHeight);
    }
  };

  useEffect(() => {
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

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    // Reset expansion states when announcement changes
    setExpanded(false);
    setNeedsExpansion(false);
    
    // Add resize listener
    window.addEventListener('resize', checkExpansion);
    
    return () => {
      window.removeEventListener('resize', checkExpansion);
    };
  }, [currentPage]);

  useEffect(() => {
    if (editor && announcements.length > 0) {
      const currentAnnouncement = announcements[currentPage - 1];
      editor.commands.setContent(currentAnnouncement.content);
      
      // Wait for next frame to check expansion
      requestAnimationFrame(() => {
        requestAnimationFrame(checkExpansion);
      });
    }
  }, [currentPage, announcements, editor]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < announcements.length) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <ViewerContainer>
        <CircularProgress />
      </ViewerContainer>
    );
  }

  if (announcements.length === 0) {
    return (
      <ViewerContainer>
        <Typography>No announcements available.</Typography>
      </ViewerContainer>
    );
  }

  const currentAnnouncement = announcements[currentPage - 1];

  return (
    <ViewerContainer>
      <LeftNavigation onClick={handlePrevious} disabled={currentPage === 1}>
        <ChevronLeftIcon />
      </LeftNavigation>

      <RightNavigation
        onClick={handleNext}
        disabled={currentPage === announcements.length}
      >
        <ChevronRightIcon />
      </RightNavigation>

      <ContentContainer>
        <AnnouncementHeader>
          <Typography variant="h5" component="h2">
            {currentAnnouncement.title}
          </Typography>
          <ImportanceBadge
            label={currentAnnouncement.importance.charAt(0).toUpperCase() + currentAnnouncement.importance.slice(1)}
            importance={currentAnnouncement.importance}
          />
        </AnnouncementHeader>

        <AnnouncementContent 
          ref={contentRef} 
          expanded={expanded} 
          needsExpansion={needsExpansion}
        >
          <EditorContent editor={editor} />
        </AnnouncementContent>

        <BottomControls>
          {needsExpansion ? (
            <>
              <PageIndicator>
                {currentPage} of {announcements.length}
              </PageIndicator>
              <ShowMoreButton
                onClick={() => setExpanded(!expanded)}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                Show {expanded ? 'Less' : 'More'}
              </ShowMoreButton>
            </>
          ) : (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <PageIndicator>
                {currentPage} of {announcements.length}
              </PageIndicator>
            </Box>
          )}
        </BottomControls>
      </ContentContainer>
    </ViewerContainer>
  );
};

export default AnnouncementsViewer;
