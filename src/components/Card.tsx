import React from 'react';
import { Card as MuiCard, CardContent, CardProps } from '@mui/material';

export default function Card({ children, className = '', ...props }: CardProps & { children: React.ReactNode; className?: string }) {
  return (
    <MuiCard className={className} {...props}>
      <CardContent>
        {children}
      </CardContent>
    </MuiCard>
  );
}
