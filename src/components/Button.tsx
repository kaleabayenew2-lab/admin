import React from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';

type Props = ButtonProps & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  const muiVariant = variant === 'primary' ? 'contained' : variant === 'secondary' ? 'outlined' : variant === 'ghost' ? 'text' : 'contained';
  const color = variant === 'danger' ? 'error' : 'primary';
  return (
    <MuiButton
      variant={muiVariant}
      color={color}
      className={className}
      {...rest}
    >
      {children}
    </MuiButton>
  );
}
