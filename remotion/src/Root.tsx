import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import data from './data.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Main"
    component={Main as any}
    durationInFrames={data.durationInFrames}
    fps={data.fps}
    width={1920}
    height={1080}
    defaultProps={{}}
  />
);
