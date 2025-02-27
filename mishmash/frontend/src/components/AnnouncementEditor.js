import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import ImageResize from 'tiptap-extension-resize-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { styled } from '@mui/material/styles';
import axiosInstance from '../utils/axios';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  Stack,
  Box,
  Typography,
  Grid,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  TableChart,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckBox,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PushPin as PushPinIcon,
  PushPinOutlined as PushPinOutlinedIcon,
} from '@mui/icons-material';

const EditorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  boxShadow: theme.customShadows.card,
  display: 'flex',
  flexDirection: 'column',
}));

const EditorContentContainer = styled(Box)({
  flex: 1,
  minHeight: '200px',
  maxHeight: '60vh',
  overflow: 'auto',
});

const StyledEditorContent = styled(EditorContent)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadii,
  backgroundColor: theme.palette.background.paper,
  '& .ProseMirror': {
    minHeight: '300px',
    '& p': {
      margin: '0.75em 0',
    },
    '& ul, & ol': {
      padding: '0 1rem',
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      '&.ProseMirror-selectednode': {
        outline: `2px solid ${theme.palette.primary.main}`,
      },
    },
    '& .resize-cursor': {
      cursor: 'ew-resize',
      cursor: 'nesw-resize',
    },
    '& .image-resizer': {
      display: 'inline-flex',
      position: 'relative',
      '& img': {
        maxWidth: '100%',
        objectFit: 'contain',
      },
      '&.ProseMirror-selectednode img': {
        outline: `2px solid ${theme.palette.primary.main}`,
      },
    },
    '& .image-resizer__handle': {
      width: '10px',
      height: '10px',
      background: theme.palette.primary.main,
      border: '1px solid white',
      position: 'absolute',
      borderRadius: '50%',
      '&.image-resizer__handle-bl': {
        bottom: '-6px',
        left: '-6px',
      },
      '&.image-resizer__handle-br': {
        bottom: '-6px',
        right: '-6px',
      },
      '&.image-resizer__handle-tl': {
        top: '-6px',
        left: '-6px',
      },
      '&.image-resizer__handle-tr': {
        top: '-6px',
        right: '-6px',
      },
      '&.image-resizer__handle-t': {
        top: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
      },
      '&.image-resizer__handle-b': {
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
      },
      '&.image-resizer__handle-l': {
        left: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
      },
      '&.image-resizer__handle-r': {
        right: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
      },
    },
  },
}));

const StatusControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const StatusControl = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const AnnouncementEditor = ({ onSave, initialData = null }) => {
  // Local state for title, importance, pinned, and cover image file
  const [title, setTitle] = useState(initialData?.title || '');
  const [importance, setImportance] = useState(initialData?.importance || 'low');
  const [pinned, setPinned] = useState(initialData?.pinned || false);
  const [isActive, setIsActive] = useState(initialData?.is_active !== false);
  const [coverImage, setCoverImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({ openOnClick: false }),
      CodeBlock,
      ImageResize.configure({
        allowResize: true,
        allowInTable: true,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    editable: true,
    content: initialData?.content || '',
  });

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const insertImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("importance", importance);
      formData.append("pinned", pinned);
      formData.append("is_active", isActive);
      formData.append("content", JSON.stringify(editor.getJSON()));
      
      // Add cover image if one was selected
      if (coverImage) {
        formData.append("cover_image", coverImage);
      }
      
      if (initialData?.id) {
        await axiosInstance.patch(`/api/announcements/${initialData.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post('/api/announcements/', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (onSave) onSave();
      if (!initialData?.id) {
        setTitle('');
        setImportance('low');
        setPinned(false);
        setIsActive(true);
        setCoverImage(null);
        editor.commands.clearContent();
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditorContainer>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Importance</InputLabel>
            <Select
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              label="Importance"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <StatusControlsContainer>
            <StatusControl>
              <IconButton
                onClick={() => setPinned(!pinned)}
                color={pinned ? "primary" : "default"}
              >
                {pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
              </IconButton>
              <Typography variant="body2">
                {pinned ? "Pinned" : "Not pinned"}
              </Typography>
            </StatusControl>
            
            <StatusControl>
              <IconButton
                onClick={() => setIsActive(!isActive)}
                color={isActive ? "primary" : "default"}
              >
                {isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
              <Typography variant="body2">
                {isActive ? "Visible to users" : "Hidden from users"}
              </Typography>
            </StatusControl>
          </StatusControlsContainer>

          {/* Cover Image Upload Section */}
          <Box sx={{ 
            border: theme => `1px solid ${theme.palette.divider}`,
            borderRadius: theme => theme.shape.borderRadii,
            p: 2,
            mb: 2
          }}>
            <Typography variant="subtitle1" gutterBottom>
              Cover Image
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              {/* Current/Preview Image */}
              <Grid item xs={12} sm={6}>
                {(initialData?.cover_image_url || coverImage) && (
                  <Box 
                    sx={{ 
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: theme => theme.shadows[2],
                      mb: 1,
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    <img
                      src={
                        coverImage 
                          ? URL.createObjectURL(coverImage) 
                          : initialData?.cover_image_url
                      }
                      alt="Cover"
                      style={{ 
                        maxWidth: "100%", 
                        maxHeight: "100%",
                        objectFit: "contain" 
                      }}
                    />
                  </Box>
                )}
                {!initialData?.cover_image_url && !coverImage && (
                  <Box 
                    sx={{ 
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #ccc',
                      borderRadius: 1,
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <Typography color="textSecondary" variant="body2">
                      No image selected
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              {/* Upload Controls */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="cover-image-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCoverImage(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="cover-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<ImageIcon />}
                      fullWidth
                    >
                      {coverImage ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  
                  {coverImage && (
                    <Button 
                      variant="text" 
                      color="error" 
                      onClick={() => setCoverImage(null)}
                      size="small"
                    >
                      Remove Selected Image
                    </Button>
                  )}
                  
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    Recommended size: 1200 × 600 pixels
                  </Typography>
                  
                  {coverImage && (
                    <Typography variant="caption">
                      Selected file: {coverImage.name} ({Math.round(coverImage.size / 1024)} KB)
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Toolbar */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" size="small" onClick={insertTable}>
              Insert Table
            </Button>
            <Tooltip title="Bold">
              <IconButton onClick={() => editor.chain().focus().toggleBold().run()}>
                <FormatBold />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic">
              <IconButton onClick={() => editor.chain().focus().toggleItalic().run()}>
                <FormatItalic />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bullet List">
              <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <FormatListBulleted />
              </IconButton>
            </Tooltip>
            <Tooltip title="Numbered List">
              <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <FormatListNumbered />
              </IconButton>
            </Tooltip>
            <Tooltip title="Insert Link">
              <IconButton onClick={insertLink}>
                <LinkIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Insert Image">
              <IconButton onClick={insertImage}>
                <ImageIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Editor Content */}
          <EditorContentContainer>
            <StyledEditorContent editor={editor} />
          </EditorContentContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving || !title.trim()}
            >
              {saving ? 'Saving...' : initialData ? 'Update Announcement' : 'Post Announcement'}
            </Button>
          </Box>
        </Stack>
      </form>
    </EditorContainer>
  );
};

export default AnnouncementEditor;