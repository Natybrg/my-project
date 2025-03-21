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
  Typography,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Settings as SettingsIcon,
  PhotoCamera as PhotoIcon
} from '@mui/icons-material';

const SynagogueGallery = ({
  images = [],
  autoPlay = true,
  interval = 5000,
  isAdmin = false,
  onImagesUpdate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedImages, setEditedImages] = useState(images);

  // טיימר למעבר אוטומטי
  React.useEffect(() => {
    let timer;
    if (autoPlay && images.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, interval);
    }
    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

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

  const handleImageChange = (index, field, value) => {
    const newImages = [...editedImages];
    newImages[index] = { ...newImages[index], [field]: value };
    setEditedImages(newImages);
  };

  const handleAddImage = () => {
    setEditedImages([
      ...editedImages,
      { id: Date.now(), url: '', caption: '', credit: '' }
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

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        position: 'relative', 
        borderRadius: 3,
        overflow: 'hidden',
        height: 400,
        bgcolor: 'background.paper',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          transform: 'translateY(-4px)'
        }
      }}
    >
      {/* תצוגת הגלריה */}
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          bgcolor: '#000'
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
                objectFit: 'contain',
                transition: 'all 0.5s ease-in-out'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                color: 'white',
                p: 3,
                transition: 'all 0.3s ease',
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {images[currentIndex].caption}
              </Typography>
              {images[currentIndex].credit && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  צילום: {images[currentIndex].credit}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            color: 'text.secondary',
            p: 4
          }}>
            <PhotoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1">
              אין תמונות בגלריה
            </Typography>
          </Box>
        )}

        {/* כפתורי ניווט */}
        {images.length > 1 && (
          <>
            <IconButton
              sx={{
                position: 'absolute',
                left: 16,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
                '&:hover': { 
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
              onClick={handlePrev}
            >
              <PrevIcon />
            </IconButton>
            <IconButton
              sx={{
                position: 'absolute',
                right: 16,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
                '&:hover': { 
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
              onClick={handleNext}
            >
              <NextIcon />
            </IconButton>
          </>
        )}

        {/* כפתורי עריכה למנהל */}
        {isAdmin && (
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            display: 'flex', 
            gap: 1 
          }}>
            <IconButton
              onClick={handleEditClick}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 1)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'background.default',
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" fontWeight={600}>
            עריכת גלריית תמונות
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {editedImages.map((image, index) => (
            <Box
              key={image.id}
              sx={{
                mb: 3,
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="כתובת URL של התמונה"
                  fullWidth
                  value={image.url}
                  onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                />
                <IconButton
                  color="error"
                  onClick={() => handleDeleteImage(index)}
                  sx={{
                    alignSelf: 'center',
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <TextField
                label="כיתוב התמונה"
                fullWidth
                value={image.caption}
                onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="קרדיט לצלם"
                fullWidth
                value={image.credit}
                onChange={(e) => handleImageChange(index, 'credit', e.target.value)}
              />
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddImage}
            sx={{
              mt: 2,
              '&:hover': { transform: 'translateY(-2px)' },
              transition: 'all 0.3s ease'
            }}
          >
            הוסף תמונה
          </Button>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2,
          bgcolor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Button onClick={() => setIsEditDialogOpen(false)}>ביטול</Button>
          <Button 
            onClick={handleSaveImages} 
            variant="contained"
            sx={{
              px: 3,
              '&:hover': { transform: 'translateY(-2px)' },
              transition: 'all 0.3s ease'
            }}
          >
            שמור שינויים
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SynagogueGallery; 