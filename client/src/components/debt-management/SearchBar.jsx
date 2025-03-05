import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Component for user search
 * @param {string} value - Search input value
 * @param {Function} onChange - Function to handle input change
 * @param {Function} onClear - Function to handle clear button click
 */
const SearchBar = ({ value, onChange, onClear }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        label="חיפוש לפי שם או טלפון"
        value={value}
        onChange={onChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton onClick={onClear} edge="end">
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Box>
  );
};

export default SearchBar;
