import { useStores } from '@/hooks';
import React from 'react';

export interface UserPhotoProps {
  logoUri: string;
  width?: string;
  height?: string;
  className?: string;
  style?: Record<string, string>;
}

const UserPhoto: React.FC<UserPhotoProps> = (props) => {
  const appStore = useStores('appStore');

  let logoUri = props.logoUri || '/default_av.jpg';
  const width = props.width || '';
  const height = props.height || '';
  const className = props.className || '';
  const style = props.style || {};

  if (appStore.isOsWindows) {
    logoUri = logoUri.replace('fs://localhost/', 'https://fs.localhost/');
  }
  return <img src={logoUri} width={width} height={height} className={className} style={style} />;
};

export default UserPhoto;
