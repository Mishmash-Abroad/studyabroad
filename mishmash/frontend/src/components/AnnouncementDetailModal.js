import React, { useState, useEffect, useRef, useCallback } from "react";
import { styled } from '@mui/material/styles';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from '@tiptap/extension-link';
import ImageResize from 'tiptap-extension-resize-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { 
  Dialog, 
  DialogContent, 
  Box,
  Typography,
  Button,
  Fade
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PushPinIcon from '@mui/icons-material/PushPin';

// Styled components
const ContentContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', // Contain children's overflow
  marginTop: theme.spacing(2),
  '& .ProseMirror': {
    outline: 'none',
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      display: 'block', // Ensures proper block layout
    },
    '& .image-resizer': {
      display: 'inline-block', // Changed from inline-flex to inline-block for better positioning
      position: 'relative',
      margin: '0 auto', // Center images if they're displayed as blocks
      '& img': {
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'block', // Ensures proper block layout
      },
    },
    // Support for text alignment classes that may be used with images
    '& .is-align-left': {
      float: 'left',
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    '& .is-align-center': {
      margin: '0 auto',
      display: 'block',
      textAlign: 'center',
    },
    '& .is-align-right': {
      float: 'right',
      marginLeft: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    // Clear floats to prevent layout issues
    '&::after': {
      content: '""',
      display: 'table',
      clear: 'both',
    },
  },
}));

const AnnouncementContent = styled('div')(({ theme, expanded, needsExpansion }) => ({
  position: 'relative',
  flex: expanded ? '1 1 auto' : '0 0 auto',
  maxHeight: expanded ? 'calc(65vh - 200px)' : '300px', // Adjustable max-height for expanded view
  minHeight: '100px',
  overflowY: expanded ? 'auto' : 'hidden',
  overflowX: 'hidden',
  padding: theme.spacing(0, 3, 3),
  transition: 'all 0.3s ease-out',
  '&::after': (!expanded && needsExpansion) ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
    pointerEvents: 'none',
  } : {},
}));

const HeaderImage = styled('div')(({ theme }) => ({
  width: '100%',
  height: '200px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  flexShrink: 0, // Prevent image from shrinking
}));

const HeaderContent = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  flexShrink: 0, // Prevent header from shrinking
}));

const NavigationButton = styled(Box)(({ theme, side }) => ({
  position: 'absolute',
  top: 0,
  [side]: 0,
  width: '50px',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  zIndex: 10,
  background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, rgba(0, 0, 0, 0.3), transparent)`,
  '&:hover': {
    opacity: 1,
  },
  color: theme.palette.common.white,
}));

const ModalContainer = styled(Box)({
  position: 'relative',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover .navigation-button': {
    opacity: 0.7
  }
});

const NavigationControls = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  flexShrink: 0, // Prevent nav controls from shrinking
}));

const PageIndicator = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const PinIconContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 8,
  left: 8,
  color: theme.palette.primary.main,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '50%',
  padding: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
}));

// Button container with fixed position
const ExpandButtonContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  flexShrink: 0, // Prevent from shrinking
}));

const AnnouncementDetailModal = ({ 
  announcement, 
  onClose, 
  allAnnouncements = [], 
  onNavigate 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef(null);
  const dialogRef = useRef(null);
  
  const currentIndex = allAnnouncements.findIndex(a => a.id === announcement.id);
  const hasNext = currentIndex < allAnnouncements.length - 1;
  const hasPrevious = currentIndex > 0;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
      }),
      ImageResize.configure({
        allowResize: false, // Disable resize in view mode
        renderHTML: (props) => {
          // Preserve any alignment classes from the editor
          const { alignment, width, height } = props.node.attrs;
          const alignClass = alignment ? `is-align-${alignment}` : '';
          
          return [
            'div',
            { class: `image-resizer ${alignClass}` },
            ['img', { src: props.node.attrs.src, width, height }]
          ];
        }
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: announcement?.content || "",
    editable: false,
    onUpdate: () => {
      checkExpansion();
    },
  });

  const checkExpansion = () => {
    if (contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      setNeedsExpansion(scrollHeight > clientHeight);
    }
  };

  const handleNext = useCallback(() => {
    if (hasNext && onNavigate) {
      onNavigate(allAnnouncements[currentIndex + 1]);
    }
  }, [hasNext, onNavigate, allAnnouncements, currentIndex]);

  const handlePrevious = useCallback(() => {
    if (hasPrevious && onNavigate) {
      onNavigate(allAnnouncements[currentIndex - 1]);
    }
  }, [hasPrevious, onNavigate, allAnnouncements, currentIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      handleNext();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      handlePrevious();
    }
  }, [handleNext, handlePrevious]);

  useEffect(() => {
    // Reset expansion states when announcement changes
    setExpanded(false);
    setNeedsExpansion(false);
    
    // Add resize listener
    window.addEventListener('resize', checkExpansion);
    // Add keyboard listener
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', checkExpansion);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [announcement, handleKeyDown]);

  useEffect(() => {
    if (editor && announcement) {
      editor.commands.setContent(announcement.content);
      
      // Wait for next frame to check expansion
      requestAnimationFrame(() => {
        requestAnimationFrame(checkExpansion);
      });
    }
  }, [announcement, editor]);

  const formattedDate = announcement?.created_at 
    ? new Date(announcement.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  return (
    <Dialog 
      open={Boolean(announcement)} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      ref={dialogRef}
      PaperProps={{
        sx: { 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden'
        }
      }}
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: 300,
      }}
    >
      <ModalContainer>
        {hasPrevious && (
          <NavigationButton 
            side="left" 
            onClick={handlePrevious}
            className="navigation-button"
          >
            <ChevronLeftIcon fontSize="large" />
          </NavigationButton>
        )}
        
        {hasNext && (
          <NavigationButton 
            side="right" 
            onClick={handleNext}
            className="navigation-button"
          >
            <ChevronRightIcon fontSize="large" />
          </NavigationButton>
        )}
        
        <ContentContainer>
          {announcement?.cover_image_url && (
            <HeaderImage style={{ backgroundImage: `url(${announcement.cover_image_url})` }}>
              {announcement.pinned && (
                <PinIconContainer>
                  <PushPinIcon fontSize="small" />
                </PinIconContainer>
              )}
            </HeaderImage>
          )}
          
          <HeaderContent>
            <Typography variant="h5" gutterBottom>
              {announcement?.title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {formattedDate}
            </Typography>
          </HeaderContent>
          
          <AnnouncementContent 
            ref={contentRef} 
            expanded={expanded} 
            needsExpansion={needsExpansion}
          >
            <EditorContent editor={editor} />
          </AnnouncementContent>
          
          <ExpandButtonContainer>
            {needsExpansion && (
              <Button
                onClick={() => setExpanded(!expanded)}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                size="small"
              >
                Show {expanded ? 'Less' : 'More'}
              </Button>
            )}
          </ExpandButtonContainer>
        </ContentContainer>
        
        {allAnnouncements.length > 1 && (
          <NavigationControls>
            <PageIndicator variant="body2">
              {currentIndex + 1} of {allAnnouncements.length}
            </PageIndicator>
          </NavigationControls>
        )}
      </ModalContainer>
    </Dialog>
  );
};

export default AnnouncementDetailModal;