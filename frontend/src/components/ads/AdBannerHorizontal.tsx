import React from 'react';

export interface AdBannerHorizontalProps {
  title: string;
  image_url: string;
  link: string;
}

export const AdBannerHorizontal: React.FC<AdBannerHorizontalProps> = ({ title, image_url, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer" className="block my-4">
    <div className="flex items-center bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition">
      <img src={image_url} alt={title} className="h-20 w-32 object-cover" />
      <div className="px-4 py-2 flex-1">
        <div className="font-bold text-gray-800 text-lg">{title}</div>
      </div>
    </div>
  </a>
);
