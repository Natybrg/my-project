import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Typography,
  Paper,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const SynagogueGallery = ({
  images = [],
  autoPlay = true,
  interval = 5000,
  isAdmin = false,
  onImagesUpdate,
  onSettingsUpdate
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editedImages, setEditedImages] = useState(images);
  const [settings, setSettings] = useState({
    autoPlay,
    interval
  });

  // טיימר למעבר אוטומטי
  React.useEffect(() => {
    let timer;
    if (settings.autoPlay && images.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, settings.interval);
    }
    return () => clearInterval(timer);
  }, [settings.autoPlay, settings.interval, images.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleEditClick = () => {
    setEditedImages([...images]);
    setIsEditDialogOpen(true);
  };

  const handleSettingsClick = () => {
    setIsSettingsDialogOpen(true);
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...editedImages];
    newImages[index] = { ...newImages[index], [field]: value };
    setEditedImages(newImages);
  };

  const handleAddImage = () => {
    setEditedImages([
      ...editedImages,
      { id: Date.now(), url: '', caption: '' }
    ]);
  };

  const handleDeleteImage = (index) => {
    const newImages = editedImages.filter((_, i) => i !== index);
    setEditedImages(newImages);
  };

  const handleSaveImages = () => {
    onImagesUpdate?.(editedImages);
    setIsEditDialogOpen(false);
  };

  const handleSaveSettings = () => {
    onSettingsUpdate?.(settings);
    setIsSettingsDialogOpen(false);
  };

  return (
    <Paper elevation={0} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      {/* תצוגת הגלריה */}
      <Box
        sx={{
          position: 'relative',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {images.length > 0 ? (
          <>
            <Box
              component="img"
              src={images[currentIndex].url}
              alt={images[currentIndex].caption}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity 0.5s ease-in-out'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                p: 2
              }}
            >
              <Typography variant="body1">
                {images[currentIndex].caption}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary">
            אין תמונות בגלריה
          </Typography>
        )}

        {/* כפתורי ניווט */}
        {images.length > 1 && (
          <>
            <IconButton
              sx={{
                position: 'absolute',
                left: 8,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' }
              }}
              onClick={handlePrev}
            >
              <PrevIcon />
            </IconButton>
            <IconButton
              sx={{
                position: 'absolute',
                right: 8,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.5)' }
              }}
              onClick={handleNext}
            >
              <NextIcon />
            </IconButton>
          </>
        )}

        {/* כפתורי עריכה למנהל */}
        {isAdmin && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleSettingsClick}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)' }}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton
              onClick={handleEditClick}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)' }}
            >
              <EditIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* דיאלוג עריכת תמונות */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>עריכת גלריית תמונות</DialogTitle>
        <DialogContent>
          <List>
            {editedImages.map((image, index) => (
              <ListItem key={image.id} divider>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                  <TextField
                    label="כתובת URL של התמונה"
                    fullWidth
                    value={image.url}
                    onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                  />
                  <TextField
                    label="כיתוב התמונה"
                    fullWidth
                    value={image.caption}
                    onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDeleteImage(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddImage}
            sx={{ mt: 2 }}
          >
            הוסף תמונה
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleSaveImages} variant="contained">
            שמור שינויים
          </Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג הגדרות */}
      <Dialog
        open={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
      >
        <DialogTitle>הגדרות גלריה</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoPlay}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                />
              }
              label="מעבר אוטומטי בין תמונות"
            />
            {settings.autoPlay && (
              <TextField
                label="זמן מעבר (באלפיות שנייה)"
                type="number"
                value={settings.interval}
                onChange={(e) => setSettings(prev => ({ ...prev, interval: Number(e.target.value) }))}
                inputProps={{ min: 1000, step: 500 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSettingsDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleSaveSettings} variant="contained">
            שמור הגדרות
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SynagogueGallery; 