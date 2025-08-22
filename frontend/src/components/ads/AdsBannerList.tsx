import React from 'react';
import { AdBannerHorizontal } from './AdBannerHorizontal';
import { Ad } from '../../types/Ad';

interface AdsBannerListProps {
  ads: Ad[];
}

export const AdsBannerList: React.FC<AdsBannerListProps> = ({ ads }) => {
  if (!ads || ads.length === 0) return null;
  return (
    <>
      {ads.map(ad => (
        <AdBannerHorizontal key={ad.id} title={ad.title} image_url={ad.image_url} link={ad.link} />
      ))}
    </>
  );
};
