import React from 'react';
import { Composition } from 'remotion';
import { ExplainerVideo } from './ExplainerVideo';
import data from './data.json';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ExplainerVideo"
      component={ExplainerVideo as any}
      durationInFrames={(data as any).durationInFrames}
      fps={(data as any).fps}
      width={1920}
      height={1080}
      defaultProps={data as any}
    />
  );
};
