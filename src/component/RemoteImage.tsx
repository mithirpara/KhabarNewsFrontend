import React, { useEffect, useState } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

type RemoteImageProps = Omit<ImageProps, 'source'> & {
  fallbackSource: ImageSourcePropType;
  uri?: string | null;
};

const RemoteImage = ({ uri, fallbackSource, ...props }: RemoteImageProps) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  return (
    <Image
      {...props}
      source={hasError || !uri ? fallbackSource : { uri }}
      onError={event => {
        setHasError(true);
        props.onError?.(event);
      }}
    />
  );
};

export default RemoteImage;
