import React from 'react';
import { Svg, Path, G, Defs, ClipPath } from 'react-native-svg';

export const GoogleIcon = (props: any) => (
  <Svg width={18} height={18} viewBox="0 0 48 48" {...props}>
    <Path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 10.4C34.782 6.946 29.744 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <Path
      fill="#FF3D00"
      d="M6.306 14.691c-1.831 3.203-2.91 6.902-2.91 10.949h20.178L6.306 14.691z"
    />
    <Path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A12.022 12.022 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025A20.01 20.01 0 0024 44z"
    />
    <Path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.031 12.031 0 01-4.087 5.571l6.19 5.238C42.618 34.61 44 29.561 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </Svg>
);